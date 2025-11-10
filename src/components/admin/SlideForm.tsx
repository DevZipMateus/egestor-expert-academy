import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SlideFormProps {
  moduleId: string;
  courseId: string;
  slideId?: number;
  onSave: () => void;
  onCancel: () => void;
}

const SlideForm = ({ moduleId, courseId, slideId, onSave, onCancel }: SlideFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'content',
    conteudo: '',
    video_url: '',
    ordem: 1,
    ativo: true,
  });

  useEffect(() => {
    if (slideId) {
      fetchSlide();
    } else {
      fetchNextOrder();
    }
  }, [slideId, moduleId]);

  const fetchSlide = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('id', slideId)
        .single();

      if (error) throw error;
      
      setFormData({
        titulo: data.titulo,
        tipo: data.tipo,
        conteudo: data.conteudo || '',
        video_url: data.video_url || '',
        ordem: data.ordem,
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao buscar slide:', error);
      toast.error('Erro ao carregar slide');
    }
  };

  const fetchNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('ordem')
        .eq('module_id', moduleId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      const nextOrder = data && data.length > 0 ? data[0].ordem + 1 : 1;
      setFormData(prev => ({ ...prev, ordem: nextOrder }));
    } catch (error) {
      console.error('Erro ao buscar próxima ordem:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slideData = {
        ...formData,
        module_id: moduleId,
        course_id: courseId,
        conteudo: formData.conteudo || null,
        video_url: formData.video_url || null,
      };

      if (slideId) {
        const { error } = await supabase
          .from('slides')
          .update(slideData)
          .eq('id', slideId);

        if (error) throw error;
        toast.success('Slide atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('slides')
          .insert(slideData);

        if (error) throw error;
        toast.success('Slide criado com sucesso!');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar slide:', error);
      toast.error('Erro ao salvar slide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-roboto">
          {slideId ? 'Editar Slide' : 'Novo Slide'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Slide *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Conteúdo</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="exercise">Exercício</SelectItem>
                <SelectItem value="attention">Atenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'video' && (
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {(formData.tipo === 'content' || formData.tipo === 'attention') && (
            <div>
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                rows={6}
                placeholder="Digite o conteúdo do slide..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="ordem">Ordem *</Label>
            <Input
              id="ordem"
              type="number"
              min="1"
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="ativo" className="cursor-pointer">Slide ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SlideForm;
