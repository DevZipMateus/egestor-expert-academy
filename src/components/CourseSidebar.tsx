
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
import { courseSlides } from '@/data/courseData';
import { Play, HelpCircle, AlertTriangle, FileText, Trophy } from 'lucide-react';

const CourseSidebar = () => {
  const navigate = useNavigate();
  const { slide } = useParams();
  const currentSlide = parseInt(slide || '1');

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

  const getSlideTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Conteúdo';
      case 'exercise':
        return 'Exercício';
      case 'attention':
        return 'Atenção';
      case 'exam':
        return 'Exame';
      case 'final':
        return 'Final';
      default:
        return 'Conteúdo';
    }
  };

  const groupedSlides = courseSlides.reduce((acc, slide) => {
    const type = getSlideTypeLabel(slide.type);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(slide);
    return acc;
  }, {} as Record<string, typeof courseSlides>);

  const handleSlideClick = (slideId: number) => {
    navigate(`/curso/${slideId}`);
  };

  return (
    <Sidebar className="w-80 bg-white border-r border-gray-200">
      <SidebarContent>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#52555b] font-roboto">
            Navegação do Curso
          </h2>
        </div>
        
        {Object.entries(groupedSlides).map(([groupType, slides]) => (
          <SidebarGroup key={groupType}>
            <SidebarGroupLabel className="text-[#52555b] font-opensans font-semibold">
              {groupType}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {slides.map((slideData) => {
                  const Icon = getSlideIcon(slideData.type);
                  const isActive = currentSlide === slideData.id;
                  
                  return (
                    <SidebarMenuItem key={slideData.id}>
                      <SidebarMenuButton
                        onClick={() => handleSlideClick(slideData.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-[#d61c00] text-white' 
                            : 'hover:bg-gray-100 text-[#52555b]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            Slide {slideData.id}
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            {slideData.title}
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
