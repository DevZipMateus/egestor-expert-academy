import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExamQuestionFormProps {
  examId: string;
  questionId?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface Option {
  texto: string;
  correta: boolean;
  ordem: number;
}

const ExamQuestionForm = ({ examId, questionId, onSave, onCancel }: ExamQuestionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [options, setOptions] = useState<Option[]>([
    { texto: '', correta: false, ordem: 1 },
    { texto: '', correta: false, ordem: 2 },
  ]);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    } else {
      fetchNextOrder();
    }
  }, [questionId, examId]);

  const fetchNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('ordem')
        .eq('exam_id', examId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (error) throw error;
      const nextOrder = data && data.length > 0 ? data[0].ordem + 1 : 1;
      setOrdem(nextOrder);
    } catch (error) {
      console.error('Erro ao buscar próxima ordem:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      const { data: questionData, error: questionError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      setPergunta(questionData.pergunta);
      setOrdem(questionData.ordem);

      const { data: optionsData, error: optionsError } = await supabase
        .from('exam_question_options')
        .select('*')
        .eq('exam_question_id', questionId)
        .order('ordem');

      if (optionsError) throw optionsError;

      if (optionsData && optionsData.length > 0) {
        setOptions(optionsData.map(opt => ({
          texto: opt.texto,
          correta: opt.correta || false,
          ordem: opt.ordem,
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar pergunta:', error);
      toast.error('Erro ao carregar pergunta');
    }
  };

  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error('Máximo de 6 opções');
      return;
    }
    setOptions([...options, { texto: '', correta: false, ordem: options.length + 1 }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('Mínimo de 2 opções');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.map((opt, i) => ({ ...opt, ordem: i + 1 })));
  };

  const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!options.some(opt => opt.correta)) {
      toast.error('Marque pelo menos uma opção correta');
      return;
    }

    if (options.some(opt => !opt.texto.trim())) {
      toast.error('Todas as opções precisam de texto');
      return;
    }

    setLoading(true);

    try {
      const questionData = { exam_id: examId, pergunta, ordem };
      let savedQuestionId = questionId;

      if (questionId) {
        const { error } = await supabase
          .from('exam_questions')
          .update(questionData)
          .eq('id', questionId);

        if (error) throw error;

        await supabase
          .from('exam_question_options')
          .delete()
          .eq('exam_question_id', questionId);
      } else {
        const { data, error } = await supabase
          .from('exam_questions')
          .insert(questionData)
          .select()
          .single();

        if (error) throw error;
        savedQuestionId = data.id;
      }

      const optionsData = options.map(opt => ({
        exam_question_id: savedQuestionId,
        texto: opt.texto,
        correta: opt.correta,
        ordem: opt.ordem,
      }));

      const { error: optionsError } = await supabase
        .from('exam_question_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast.success(questionId ? 'Pergunta atualizada!' : 'Pergunta criada!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar pergunta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{questionId ? 'Editar Pergunta' : 'Nova Pergunta'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Pergunta *</Label>
            <Textarea
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Ordem</Label>
            <Input
              type="number"
              min="1"
              value={ordem}
              onChange={(e) => setOrdem(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opções *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                disabled={options.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {options.map((option, index) => (
              <Card key={index} className="p-3">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Opção ${index + 1}`}
                      value={option.texto}
                      onChange={(e) => handleOptionChange(index, 'texto', e.target.value)}
                      required
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={option.correta}
                        onChange={(e) => handleOptionChange(index, 'correta', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Resposta correta</span>
                    </div>
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="bg-primary">
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

export default ExamQuestionForm;
