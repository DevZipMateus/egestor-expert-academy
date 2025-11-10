import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionFormIntegratedProps {
  moduleId: string;
  courseId: string;
  questionId?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface Option {
  texto: string;
  correta: boolean;
  ordem: number;
}

const QuestionFormIntegrated = ({ moduleId, courseId, questionId, onSave, onCancel }: QuestionFormIntegratedProps) => {
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    pergunta: '',
    explicacao: '',
    slide_id: '',
  });
  const [options, setOptions] = useState<Option[]>([
    { texto: '', correta: false, ordem: 1 },
    { texto: '', correta: false, ordem: 2 },
  ]);

  useEffect(() => {
    fetchSlides();
    if (questionId) {
      fetchQuestion();
    }
  }, [moduleId, questionId]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('id, titulo, ordem')
        .eq('module_id', moduleId)
        .order('ordem');

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      setFormData({
        pergunta: questionData.pergunta,
        explicacao: questionData.explicacao || '',
        slide_id: questionData.slide_id?.toString() || '',
      });

      const { data: optionsData, error: optionsError } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
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
      toast.error('Máximo de 6 opções permitidas');
      return;
    }
    setOptions([...options, { texto: '', correta: false, ordem: options.length + 1 }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('Mínimo de 2 opções necessárias');
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
      toast.error('Pelo menos uma opção deve ser marcada como correta');
      return;
    }

    if (options.some(opt => !opt.texto.trim())) {
      toast.error('Todas as opções devem ter texto');
      return;
    }

    setLoading(true);

    try {
      const questionData = {
        pergunta: formData.pergunta,
        explicacao: formData.explicacao || null,
        slide_id: formData.slide_id ? parseInt(formData.slide_id) : null,
        course_id: courseId,
      };

      let savedQuestionId = questionId;

      if (questionId) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', questionId);

        if (error) throw error;

        // Deletar opções antigas
        await supabase
          .from('question_options')
          .delete()
          .eq('question_id', questionId);
      } else {
        const { data, error } = await supabase
          .from('questions')
          .insert(questionData)
          .select()
          .single();

        if (error) throw error;
        savedQuestionId = data.id;
      }

      // Inserir novas opções
      const optionsData = options.map(opt => ({
        question_id: savedQuestionId,
        texto: opt.texto,
        correta: opt.correta,
        ordem: opt.ordem,
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast.success(questionId ? 'Pergunta atualizada!' : 'Pergunta criada!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      toast.error('Erro ao salvar pergunta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-roboto">
          {questionId ? 'Editar Pergunta' : 'Nova Pergunta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pergunta">Pergunta *</Label>
            <Textarea
              id="pergunta"
              value={formData.pergunta}
              onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="slide_id">Vincular ao Slide (opcional)</Label>
            <Select
              value={formData.slide_id}
              onValueChange={(value) => setFormData({ ...formData, slide_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um slide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum slide</SelectItem>
                {slides.map((slide) => (
                  <SelectItem key={slide.id} value={slide.id.toString()}>
                    {slide.ordem}. {slide.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="explicacao">Explicação (opcional)</Label>
            <Textarea
              id="explicacao"
              value={formData.explicacao}
              onChange={(e) => setFormData({ ...formData, explicacao: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opções de Resposta *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                disabled={options.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Opção
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
                      <span className="text-sm text-muted-foreground">Esta é a resposta correta</span>
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

export default QuestionFormIntegrated;
