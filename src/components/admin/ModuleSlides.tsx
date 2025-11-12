import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Video, FileText, AlertCircle, GripVertical, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import SlideForm from './SlideForm';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Slide {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  ativo: boolean;
  video_url: string | null;
  conteudo: string | null;
  question_count?: number;
}

interface SortableSlideItemProps {
  slide: Slide;
  onEdit: () => void;
  onDelete: () => void;
  getSlideIcon: (tipo: string) => JSX.Element;
  getSlideTypeLabel: (tipo: string) => string;
  getQuestionBadge: (slide: Slide) => JSX.Element | null;
}

const SortableSlideItem = ({ slide, onEdit, onDelete, getSlideIcon, getSlideTypeLabel, getQuestionBadge }: SortableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="hover:bg-muted/50 transition-colors">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            {getSlideIcon(slide.tipo)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{slide.titulo}</p>
                {getQuestionBadge(slide)}
              </div>
              <p className="text-xs text-muted-foreground">
                {getSlideTypeLabel(slide.tipo)} · Ordem: {slide.ordem}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ModuleSlidesProps {
  moduleId: string;
  courseId: string;
}

const ModuleSlides = ({ moduleId, courseId }: ModuleSlidesProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSlides();
  }, [moduleId]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('module_id', moduleId)
        .order('ordem');

      if (error) throw error;

      // Buscar contagem de perguntas para slides de exercício
      const slidesWithCounts = await Promise.all(
        (data || []).map(async (slide) => {
          if (slide.tipo === 'exercise') {
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('slide_id', slide.id);
            return { ...slide, question_count: count || 0 };
          }
          return slide;
        })
      );

      setSlides(slidesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      toast.error('Erro ao carregar slides');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSlide = () => {
    setEditingSlide(null);
    setShowSlideForm(true);
  };

  const handleEditSlide = (slideId: number) => {
    setEditingSlide(slideId);
    setShowSlideForm(true);
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (!confirm('Tem certeza que deseja excluir este slide?')) return;

    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;
      toast.success('Slide excluído com sucesso!');
      fetchSlides();
    } catch (error) {
      console.error('Erro ao excluir slide:', error);
      toast.error('Erro ao excluir slide');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex(s => s.id.toString() === active.id);
    const newIndex = slides.findIndex(s => s.id.toString() === over.id);

    const newSlides = arrayMove(slides, oldIndex, newIndex);
    setSlides(newSlides);

    // Atualizar ordens no banco de dados
    try {
      const updates = newSlides.map((slide, index) => 
        supabase
          .from('slides')
          .update({ ordem: index + 1 })
          .eq('id', slide.id)
      );

      await Promise.all(updates);
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem');
      fetchSlides();
    }
  };

  const getSlideIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'exercise':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'attention':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSlideTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      video: 'Vídeo',
      exercise: 'Exercício',
      attention: 'Atenção',
      content: 'Conteúdo',
      exam: 'Exame',
    };
    return labels[tipo] || tipo;
  };

  const getQuestionBadge = (slide: Slide) => {
    if (slide.tipo !== 'exercise') return null;

    const count = slide.question_count || 0;
    
    if (count === 0) {
      return (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Sem perguntas
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {count} {count === 1 ? 'pergunta' : 'perguntas'}
      </Badge>
    );
  };

  if (showSlideForm) {
    return (
      <SlideForm
        moduleId={moduleId}
        courseId={courseId}
        slideId={editingSlide || undefined}
        onSave={() => {
          setShowSlideForm(false);
          setEditingSlide(null);
          fetchSlides();
        }}
        onCancel={() => {
          setShowSlideForm(false);
          setEditingSlide(null);
        }}
      />
    );
  }

  if (loading) return <div className="text-sm text-muted-foreground">Carregando slides...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Slides do Módulo</h4>
        <Button size="sm" onClick={handleNewSlide} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" />
          Novo Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum slide cadastrado.</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleNewSlide}
              className="mt-3"
            >
              Criar primeiro slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map(s => s.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {slides.map((slide) => (
                <SortableSlideItem
                  key={slide.id}
                  slide={slide}
                  onEdit={() => handleEditSlide(slide.id)}
                  onDelete={() => handleDeleteSlide(slide.id)}
                  getSlideIcon={getSlideIcon}
                  getSlideTypeLabel={getSlideTypeLabel}
                  getQuestionBadge={getQuestionBadge}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ModuleSlides;
