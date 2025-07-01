
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuestionOption {
  id?: string;
  texto: string;
  correta: boolean;
  ordem: number;
}

interface QuestionFormProps {
  questionId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionForm = ({ questionId, onSave, onCancel }: QuestionFormProps) => {
  const [pergunta, setPergunta] = useState('');
  const [explicacao, setExplicacao] = useState('');
  const [slideId, setSlideId] = useState<number | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([
    { texto: '', correta: false, ordem: 1 },
    { texto: '', correta: false, ordem: 2 }
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      const { data: question, error } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('id', questionId)
        .single();

      if (error) throw error;

      setPergunta(question.pergunta);
      setExplicacao(question.explicacao || '');
      setSlideId(question.slide_id);
      
      if (question.question_options) {
        const sortedOptions = question.question_options.sort((a: any, b: any) => a.ordem - b.ordem);
        setOptions(sortedOptions);
        const correctIndex = sortedOptions.findIndex((opt: any) => opt.correta);
        setCorrectOptionIndex(correctIndex >= 0 ? correctIndex : 0);
      }
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error);
      toast.error('Erro ao carregar pergunta');
    }
  };

  const addOption = () => {
    setOptions([...options, { texto: '', correta: false, ordem: options.length + 1 }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('É necessário ter pelo menos 2 alternativas');
      return;
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.map((opt, i) => ({ ...opt, ordem: i + 1 })));
    
    // Ajustar o índice da resposta correta se necessário
    if (correctOptionIndex >= index && correctOptionIndex > 0) {
      setCorrectOptionIndex(correctOptionIndex - 1);
    }
  };

  const updateOption = (index: number, texto: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], texto };
    setOptions(newOptions);
  };

  const handleSave = async () => {
    if (!pergunta.trim()) {
      toast.error('Por favor, insira a pergunta');
      return;
    }

    if (options.some(opt => !opt.texto.trim())) {
      toast.error('Todas as alternativas devem ser preenchidas');
      return;
    }

    if (options.length < 2) {
      toast.error('É necessário ter pelo menos 2 alternativas');
      return;
    }

    setLoading(true);

    try {
      // Atualizar flags de resposta correta
      const updatedOptions = options.map((opt, index) => ({
        ...opt,
        correta: index === correctOptionIndex
      }));

      if (questionId) {
        // Atualizar pergunta existente
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            pergunta,
            explicacao,
            slide_id: slideId,
            updated_at: new Date().toISOString()
          })
          .eq('id', questionId);

        if (questionError) throw questionError;

        // Deletar opções antigas
        const { error: deleteError } = await supabase
          .from('question_options')
          .delete()
          .eq('question_id', questionId);

        if (deleteError) throw deleteError;

        // Inserir novas opções
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(
            updatedOptions.map(opt => ({
              question_id: questionId,
              texto: opt.texto,
              correta: opt.correta,
              ordem: opt.ordem
            }))
          );

        if (optionsError) throw optionsError;

        toast.success('Pergunta atualizada com sucesso!');
      } else {
        // Criar nova pergunta
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            pergunta,
            explicacao,
            slide_id: slideId
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Inserir opções
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(
            updatedOptions.map(opt => ({
              question_id: questionData.id,
              texto: opt.texto,
              correta: opt.correta,
              ordem: opt.ordem
            }))
          );

        if (optionsError) throw optionsError;

        toast.success('Pergunta criada com sucesso!');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      toast.error('Erro ao salvar pergunta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
            {questionId ? 'Editar Pergunta' : 'Nova Pergunta'}
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
          <Label htmlFor="pergunta">Pergunta</Label>
          <Textarea
            id="pergunta"
            placeholder="Digite a pergunta..."
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slide">Slide Associado (opcional)</Label>
          <Input
            id="slide"
            type="number"
            placeholder="Número do slide"
            value={slideId || ''}
            onChange={(e) => setSlideId(e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Alternativas</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Alternativa
            </Button>
          </div>

          <RadioGroup
            value={correctOptionIndex.toString()}
            onValueChange={(value) => setCorrectOptionIndex(parseInt(value))}
            className="space-y-3"
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value={index.toString()} />
                <div className="flex-1">
                  <Input
                    placeholder={`Alternativa ${index + 1}`}
                    value={option.texto}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
          <p className="text-sm text-gray-600">
            Selecione o círculo da alternativa correta
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="explicacao">Explicação (opcional)</Label>
          <Textarea
            id="explicacao"
            placeholder="Explicação da resposta..."
            value={explicacao}
            onChange={(e) => setExplicacao(e.target.value)}
            className="min-h-[80px]"
          />
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

export default QuestionForm;
