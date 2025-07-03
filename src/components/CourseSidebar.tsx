
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
import { Play, HelpCircle, AlertTriangle, FileText, Trophy } from 'lucide-react';

interface SlideData {
  id: number;
  titulo: string;
  tipo: string;
  conteudo: string | null;
  video_url: string | null;
  ordem: number;
  module_id: string | null;
  course_id: string | null;
}

const CourseSidebar = () => {
  const navigate = useNavigate();
  const { slide } = useParams();
  const currentSlide = parseInt(slide || '1');
  const { slides, loading, useStaticData } = useCourseData();

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

  const handleSlideClick = (slideOrder: number) => {
    navigate(`/curso/${slideOrder}`);
  };

  if (loading) {
    return (
      <Sidebar className="w-80 bg-white border-r border-gray-200">
        <SidebarContent>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#52555b] font-roboto">
              Carregando...
            </h2>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Organizar slides por ordem sequencial em grupos lógicos
  const organizeSlidesByRange = (slidesList: SlideData[]) => {
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
    <Sidebar className="w-80 bg-white border-r border-gray-200">
      <SidebarContent>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#52555b] font-roboto">
            Expert eGestor
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {slides.length} slides disponíveis
          </p>
          {useStaticData && (
            <p className="text-xs text-yellow-600 mt-1">Modo Offline</p>
          )}
        </div>
        
        {slideGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className="text-[#52555b] font-opensans font-semibold">
              {group.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.slides.map((slideData) => {
                  const Icon = getSlideIcon(slideData.tipo);
                  const isActive = currentSlide === slideData.ordem;
                  
                  return (
                    <SidebarMenuItem key={slideData.id}>
                      <SidebarMenuButton
                        onClick={() => handleSlideClick(slideData.ordem)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-[#d61c00] text-white' 
                            : 'hover:bg-gray-100 text-[#52555b]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
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
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default CourseSidebar;
