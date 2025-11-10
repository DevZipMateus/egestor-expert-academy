import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Video, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import SlideForm from './SlideForm';

interface Slide {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  ativo: boolean;
  video_url: string | null;
  conteudo: string | null;
}

interface ModuleSlidesProps {
  moduleId: string;
  courseId: string;
}

const ModuleSlides = ({ moduleId, courseId }: ModuleSlidesProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);

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
      setSlides(data || []);
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
    };
    return labels[tipo] || tipo;
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
        <div className="space-y-2">
          {slides.map((slide) => (
            <Card key={slide.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getSlideIcon(slide.tipo)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{slide.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {getSlideTypeLabel(slide.tipo)} · Ordem: {slide.ordem}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSlide(slide.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleSlides;
