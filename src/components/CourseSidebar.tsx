
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
import { Play, HelpCircle, AlertTriangle, FileText, Trophy, Lock, BookOpen, FastForward } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CourseSidebar = () => {
  const navigate = useNavigate();
  const { slide, courseId } = useParams();
  const currentSlide = parseInt(slide || '0');
  const { slides, loading, useStaticData, answeredSlides } = useCourseData();
  const { user } = useAuth();
  const { isAdmin } = useUserRole(user?.email || null);

  // Verificar se o exame está desbloqueado (todos os 46 slides de conteúdo completados)
  const isExamUnlocked = () => {
    const contentSlides = Array.from({ length: 46 }, (_, i) => i + 1);
    return contentSlides.every(slideNum => answeredSlides.has(slideNum));
  };

  // Função para admins pularem todos os slides
  const handleSkipAllSlides = async () => {
    if (!user || !courseId) return;
    
    try {
      const allContentSlides = Array.from({ length: 46 }, (_, i) => i + 1);
      
      const { error } = await supabase
        .from('progresso_usuario')
        .update({
          aulas_assistidas: allContentSlides,
          progresso_percentual: 100,
          data_atualizacao: new Date().toISOString()
        })
        .eq('usuario_id', user.id)
        .eq('course_id', courseId);
      
      if (error) throw error;
      
      toast.success('Todos os slides foram marcados como assistidos!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao pular slides:', error);
      toast.error('Erro ao pular slides. Tente novamente.');
    }
  };

  const getSlideIcon = (type: string, isIntro: boolean = false) => {
    if (isIntro) return BookOpen;
    switch (type) {
      case 'content':
      case 'video':
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
      <Sidebar collapsible="offcanvas" className="bg-white border-r border-gray-200">
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

  // Agrupar slides por módulo real
  const organizeSlidesByModule = (slidesList: typeof slides) => {
    const moduleGroups: Record<string, { name: string; ordem: number; slides: typeof slides }> = {};
    
    slidesList.forEach(slideData => {
      const moduleName = slideData.modules?.titulo || 'Sem Módulo';
      const moduleOrdem = slideData.modules?.ordem || 0;
      
      if (!moduleGroups[moduleName]) {
        moduleGroups[moduleName] = {
          name: moduleName,
          ordem: moduleOrdem,
          slides: []
        };
      }
      moduleGroups[moduleName].slides.push(slideData);
    });

    // Ordenar grupos por ordem do módulo e slides dentro de cada grupo
    return Object.values(moduleGroups)
      .sort((a, b) => a.ordem - b.ordem)
      .map(group => ({
        ...group,
        slides: group.slides.sort((a, b) => a.ordem - b.ordem)
      }));
  };

  const slideGroups = organizeSlidesByModule(slides);

  // Calcular progresso (excluindo introdução e exame)
  // Slides de conteúdo: ordem 1-46, Exame: ordem 47, Introdução: ordem -2 e -1
  const totalContentSlides = 46;
  const completedSlides = Array.from(answeredSlides).filter(s => s >= 1 && s <= 46).length;
  const progressPercentage = Math.round((completedSlides / totalContentSlides) * 100);

  return (
    <Sidebar collapsible="offcanvas" className="bg-white border-r border-gray-200">
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
        
        {/* Indicador de Progresso */}
        <div className="p-3 md:p-4 border-b border-gray-200 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-medium text-foreground">
              Seu Progresso
            </span>
            <span className="text-xs md:text-sm font-bold text-primary">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedSlides} de {totalContentSlides} slides completados
          </p>
        </div>
        
        {/* Botão para admins pularem todos os slides */}
        {isAdmin && (
          <div className="px-3 md:px-4 py-2 border-b border-gray-200">
            <Button
              onClick={handleSkipAllSlides}
              variant="outline"
              size="sm"
              className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <FastForward className="h-4 w-4 mr-2" />
              Pular todos (Admin)
            </Button>
          </div>
        )}
        
        <div className="overflow-y-auto">
          {slideGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarGroupLabel className="text-[#52555b] font-opensans font-semibold text-xs md:text-sm px-3 md:px-4">
                {group.name}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.slides.map((slideData) => {
                    const isIntroSlide = slideData.ordem < 0;
                    const isExamSlide = slideData.tipo === 'exam';
                    const isLocked = isExamSlide && !isExamUnlocked();
                    const Icon = isLocked ? Lock : getSlideIcon(slideData.tipo, isIntroSlide);
                    const isActive = currentSlide === slideData.ordem;
                    
                    // Definir label baseado no tipo
                    const getSlideLabel = () => {
                      if (isIntroSlide) return 'Introdução';
                      if (slideData.tipo === 'exercise') return 'Exercício';
                      if (slideData.tipo === 'attention') return 'Atenção';
                      if (slideData.tipo === 'exam') return 'Exame Final';
                      return 'Aula';
                    };

                    // Não mostrar número para slides de introdução
                    const slideLabel = isIntroSlide 
                      ? getSlideLabel()
                      : `${slideData.ordem}. ${getSlideLabel()}`;
                    
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
                              {slideLabel}
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
