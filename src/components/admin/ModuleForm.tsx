
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ModuleFormProps {
  courseId: string;
  moduleId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const ModuleForm = ({ courseId, moduleId, onSave, onCancel }: ModuleFormProps) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moduleId) {
      loadModule();
    } else {
      // Definir ordem baseada no número de módulos existentes
      getNextOrder();
    }
  }, [moduleId, courseId]);

  const loadModule = async () => {
    try {
      const { data: module, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;

      setNome(module.nome);
      setDescricao(module.descricao || '');
      setOrdem(module.ordem);
      setAtivo(module.ativo);
    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
      toast.error('Erro ao carregar módulo');
    }
  };

  const getNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('ordem')
        .eq('course_id', courseId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (error) throw error;

      setOrdem((data?.[0]?.ordem || 0) + 1);
    } catch (error) {
      console.error('Erro ao obter próxima ordem:', error);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Por favor, insira o nome do módulo');
      return;
    }

    setLoading(true);

    try {
      if (moduleId) {
        const { error } = await supabase
          .from('course_modules')
          .update({
            nome,
            descricao,
            ordem,
            ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', moduleId);

        if (error) throw error;
        toast.success('Módulo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('course_modules')
          .insert({
            course_id: courseId,
            nome,
            descricao,
            ordem,
            ativo
          });

        if (error) throw error;
        toast.success('Módulo criado com sucesso!');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
      toast.error('Erro ao salvar módulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
            {moduleId ? 'Editar Módulo' : 'Novo Módulo'}
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
          <Label htmlFor="nome">Nome do Módulo</Label>
          <Input
            id="nome"
            placeholder="Digite o nome do módulo..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva o módulo..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem no Curso</Label>
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
          <Label htmlFor="ativo">Módulo ativo</Label>
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

export default ModuleForm;
