
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
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState(1);
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

      setNome(course.nome);
      setDescricao(course.descricao || '');
      setOrdem(course.ordem);
      setAtivo(course.ativo);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      toast.error('Erro ao carregar curso');
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Por favor, insira o nome do curso');
      return;
    }

    setLoading(true);

    try {
      if (courseId) {
        const { error } = await supabase
          .from('courses')
          .update({
            nome,
            descricao,
            ordem,
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
            nome,
            descricao,
            ordem,
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
          <Label htmlFor="nome">Nome do Curso</Label>
          <Input
            id="nome"
            placeholder="Digite o nome do curso..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
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

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem de Apresentação</Label>
          <Input
            id="ordem"
            type="number"
            min="1"
            value={ordem}
            onChange={(e) => setOrdem(parseInt(e.target.value) || 1)}
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
