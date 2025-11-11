
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCourseData } from '@/hooks/useCourseData';
import { Play, HelpCircle, AlertTriangle, FileText, Trophy, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CourseSidebar = () => {
  const navigate = useNavigate();
  const { slide, courseId } = useParams();
  const currentSlide = parseInt(slide || '1');
  const { slides, loading, useStaticData, answeredSlides } = useCourseData();

  // Verificar se o exame está desbloqueado (todos os 46 slides anteriores completados)
  const isExamUnlocked = () => {
    const contentSlides = Array.from({ length: 46 }, (_, i) => i + 1);
    return contentSlides.every(slideNum => answeredSlides.has(slideNum));
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'content':
        return Play;
      case 'exercise':
        return HelpCircle;
      case 'attention':
        return AlertTriangle;
      case 'exam':
        return Trophy;
      case 'final':
        return FileText;
      default:
        return Play;
    }
  };

  const handleSlideClick = (slideOrder: number, isLocked: boolean) => {
    if (isLocked) {
      return; // Não permitir navegação para slides bloqueados
    }
    navigate(`/curso/${courseId}/${slideOrder}`);
  };

  if (loading) {
    return (
      <Sidebar className="w-64 md:w-80 bg-white border-r border-gray-200">
        <SidebarContent>
          <div className="p-3 md:p-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-[#52555b] font-roboto">
              Carregando...
            </h2>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const organizeSlidesByRange = (slidesList: typeof slides) => {
    return [
      {
        name: 'Clientes e Fornecedores',
        slides: slidesList.filter(s => s.ordem >= 1 && s.ordem <= 3)
      },
      {
        name: 'Produtos e Estoque',
        slides: slidesList.filter(s => s.ordem >= 4 && s.ordem <= 7)
      },
      {
        name: 'Vendas e Pagamentos',
        slides: slidesList.filter(s => s.ordem >= 8 && s.ordem <= 25)
      },
      {
        name: 'Compras e Fiscal',
        slides: slidesList.filter(s => s.ordem >= 26 && s.ordem <= 30)
      },
      {
        name: 'Configurações Avançadas',
        slides: slidesList.filter(s => s.ordem >= 31 && s.ordem <= 46)
      },
      {
        name: 'Exame Final',
        slides: slidesList.filter(s => s.ordem === 47)
      }
    ].filter(group => group.slides.length > 0);
  };

  const slideGroups = organizeSlidesByRange(slides);

  return (
    <Sidebar className="w-64 md:w-80 bg-white border-r border-gray-200">
      <SidebarContent>
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-bold text-[#52555b] font-roboto">
            Expert eGestor
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {slides.length} slides disponíveis
          </p>
          {useStaticData && (
            <p className="text-xs text-yellow-600 mt-1">Modo Offline</p>
          )}
        </div>
        
        <div className="overflow-y-auto">
          {slideGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarGroupLabel className="text-[#52555b] font-opensans font-semibold text-xs md:text-sm px-3 md:px-4">
                {group.name}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.slides.map((slideData) => {
                    const isExamSlide = slideData.ordem === 47;
                    const isLocked = isExamSlide && !isExamUnlocked();
                    const Icon = isLocked ? Lock : getSlideIcon(slideData.tipo);
                    const isActive = currentSlide === slideData.ordem;
                    
                    const slideButton = (
                      <SidebarMenuItem key={slideData.id}>
                        <SidebarMenuButton
                          onClick={() => handleSlideClick(slideData.ordem, isLocked)}
                          className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-colors mx-2 ${
                            isActive 
                              ? 'bg-[#d61c00] text-white' 
                              : isLocked
                              ? 'opacity-40 cursor-not-allowed text-[#52555b]'
                              : 'hover:bg-gray-100 text-[#52555b]'
                          }`}
                          disabled={isLocked}
                        >
                          <Icon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs md:text-sm font-medium truncate">
                              {slideData.ordem}. {slideData.tipo === 'exercise' ? 'Exercício' : 
                               slideData.tipo === 'attention' ? 'Atenção' :
                               slideData.tipo === 'exam' ? 'Exame' : 'Aula'}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {slideData.titulo}
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );

                    if (isLocked) {
                      return (
                        <TooltipProvider key={slideData.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {slideButton}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Complete todos os slides anteriores para desbloquear o exame</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return slideButton;
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default CourseSidebar;
