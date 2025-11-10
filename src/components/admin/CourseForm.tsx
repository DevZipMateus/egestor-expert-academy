
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CourseFormProps {
  courseId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const CourseForm = ({ courseId, onSave, onCancel }: CourseFormProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [slug, setSlug] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      setTitulo(course.titulo);
      setDescricao(course.descricao || '');
      setSlug(course.slug || '');
      setAtivo(course.ativo);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      toast.error('Erro ao carregar curso');
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTituloChange = (newTitulo: string) => {
    setTitulo(newTitulo);
    if (!courseId && !slug) {
      setSlug(generateSlug(newTitulo));
    }
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      toast.error('Por favor, insira o título do curso');
      return;
    }

    if (!slug.trim()) {
      toast.error('Por favor, insira o slug do curso');
      return;
    }

    setLoading(true);

    try {
      if (courseId) {
        const { error } = await supabase
          .from('courses')
          .update({
            titulo,
            descricao,
            slug,
            ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId);

        if (error) throw error;
        toast.success('Curso atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('courses')
          .insert({
            titulo,
            descricao,
            slug,
            ativo
          });

        if (error) throw error;
        toast.success('Curso criado com sucesso!');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      toast.error('Erro ao salvar curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
            {courseId ? 'Editar Curso' : 'Novo Curso'}
          </CardTitle>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título do Curso</Label>
          <Input
            id="titulo"
            placeholder="Digite o título do curso..."
            value={titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL amigável)</Label>
          <Input
            id="slug"
            placeholder="slug-do-curso"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
          />
          <p className="text-sm text-gray-500">
            Link do curso: {window.location.origin}/c/{slug || 'slug-do-curso'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva o curso..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
          />
          <Label htmlFor="ativo">Curso ativo</Label>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
