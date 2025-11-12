import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SlideFormProps {
  moduleId: string;
  courseId: string;
  slideId?: number;
  onSave: () => void;
  onCancel: () => void;
}

interface QuestionOption {
  id?: string;
  texto: string;
  correta: boolean;
  ordem: number;
}

interface ExerciseQuestion {
  id?: string;
  pergunta: string;
  explicacao: string;
  options: QuestionOption[];
}

const SlideForm = ({ moduleId, courseId, slideId, onSave, onCancel }: SlideFormProps) => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Array<{ id: string; titulo: string }>>([]);
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'content',
    conteudo: '',
    video_url: '',
    exam_id: '',
    ordem: 1,
    ativo: true,
  });

  useEffect(() => {
    fetchExams();
    if (slideId) {
      fetchSlide();
      fetchQuestions();
    } else {
      fetchNextOrder();
    }
  }, [slideId, moduleId]);

  useEffect(() => {
    // Auto-adicionar pergunta vazia quando tipo mudar para exercise
    if (formData.tipo === 'exercise' && questions.length === 0 && !slideId) {
      addQuestion();
    }
  }, [formData.tipo]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('course_exams')
        .select('id, titulo')
        .eq('course_id', courseId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
    }
  };

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
        exam_id: data.exam_id || '',
        ordem: data.ordem,
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao buscar slide:', error);
      toast.error('Erro ao carregar slide');
    }
  };

  const fetchQuestions = async () => {
    if (!slideId) return;
    
    try {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select(`
          id,
          pergunta,
          explicacao,
          question_options (
            id,
            texto,
            correta,
            ordem
          )
        `)
        .eq('slide_id', slideId)
        .order('pergunta');

      if (error) throw error;

      const formattedQuestions: ExerciseQuestion[] = (questionsData || []).map((q: any) => ({
        id: q.id,
        pergunta: q.pergunta,
        explicacao: q.explicacao || '',
        options: (q.question_options || []).sort((a: any, b: any) => a.ordem - b.ordem),
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
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

  const addQuestion = () => {
    setQuestions([...questions, {
      pergunta: '',
      explicacao: '',
      options: [
        { texto: '', correta: false, ordem: 1 },
        { texto: '', correta: false, ordem: 2 },
      ],
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof ExerciseQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const currentOptions = updated[questionIndex].options;
    updated[questionIndex].options = [
      ...currentOptions,
      { texto: '', correta: false, ordem: currentOptions.length + 1 },
    ];
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options
      .filter((_, i) => i !== optionIndex)
      .map((opt, i) => ({ ...opt, ordem: i + 1 }));
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: any) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options];
    
    if (field === 'correta' && value === true) {
      // Desmarcar outras opções como corretas
      options.forEach((opt, i) => {
        if (i !== optionIndex) opt.correta = false;
      });
    }
    
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const validateExercise = () => {
    if (formData.tipo !== 'exercise') return true;

    if (questions.length === 0) {
      toast.error('Slides de exercício precisam ter pelo menos 1 pergunta');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.pergunta.trim()) {
        toast.error(`Pergunta ${i + 1}: o texto da pergunta é obrigatório`);
        return false;
      }

      if (q.options.length < 2) {
        toast.error(`Pergunta ${i + 1}: precisa ter pelo menos 2 opções`);
        return false;
      }

      const hasCorrect = q.options.some(opt => opt.correta);
      if (!hasCorrect) {
        toast.error(`Pergunta ${i + 1}: precisa ter pelo menos 1 opção marcada como correta`);
        return false;
      }

      const hasEmptyOption = q.options.some(opt => !opt.texto.trim());
      if (hasEmptyOption) {
        toast.error(`Pergunta ${i + 1}: todas as opções precisam ter texto`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExercise()) return;

    setLoading(true);

    try {
      const slideData = {
        ...formData,
        module_id: moduleId,
        course_id: courseId,
        conteudo: formData.conteudo || null,
        video_url: formData.video_url || null,
        exam_id: formData.exam_id || null,
      };

      let savedSlideId = slideId;

      if (slideId) {
        const { error } = await supabase
          .from('slides')
          .update(slideData)
          .eq('id', slideId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('slides')
          .insert(slideData)
          .select()
          .single();

        if (error) throw error;
        savedSlideId = data.id;
      }

      // Salvar perguntas se for exercício
      if (formData.tipo === 'exercise' && savedSlideId) {
        // Deletar perguntas antigas se estiver editando
        if (slideId) {
          const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('slide_id', slideId);

          if (deleteError) throw deleteError;
        }

        // Inserir novas perguntas
        for (const question of questions) {
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              slide_id: savedSlideId,
              course_id: courseId,
              pergunta: question.pergunta,
              explicacao: question.explicacao || null,
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Inserir opções da pergunta
          const optionsToInsert = question.options.map(opt => ({
            question_id: questionData.id,
            texto: opt.texto,
            correta: opt.correta,
            ordem: opt.ordem,
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      toast.success(slideId ? 'Slide atualizado com sucesso!' : 'Slide criado com sucesso!');
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
                <SelectItem value="exam">Exame</SelectItem>
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

          {formData.tipo === 'exam' && (
            <div>
              <Label htmlFor="exam_id">Selecione o Exame *</Label>
              <Select
                value={formData.exam_id}
                onValueChange={(value) => setFormData({ ...formData, exam_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um exame" />
                </SelectTrigger>
                <SelectContent>
                  {exams.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhum exame disponível
                    </SelectItem>
                  ) : (
                    exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.titulo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Crie exames na aba "Exame Final" antes de adicionar um slide de exame
              </p>
            </div>
          )}

          {formData.tipo === 'exercise' && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base">Perguntas do Exercício *</Label>
                <Button type="button" size="sm" onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Pergunta
                </Button>
              </div>

              {questions.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Um slide de exercício precisa ter pelo menos 1 pergunta com opções de resposta.
                  </AlertDescription>
                </Alert>
              )}

              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="bg-background">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Pergunta {qIndex + 1} *</Label>
                          <Textarea
                            value={question.pergunta}
                            onChange={(e) => updateQuestion(qIndex, 'pergunta', e.target.value)}
                            placeholder="Digite a pergunta..."
                            rows={2}
                            required
                          />
                        </div>

                        <div>
                          <Label>Explicação (opcional)</Label>
                          <Textarea
                            value={question.explicacao}
                            onChange={(e) => updateQuestion(qIndex, 'explicacao', e.target.value)}
                            placeholder="Explicação mostrada após responder..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Opções de Resposta *</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addOption(qIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Opção
                            </Button>
                          </div>

                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.correta}
                                onChange={(e) => updateOption(qIndex, oIndex, 'correta', e.target.checked)}
                                className="w-4 h-4 shrink-0"
                                title="Marcar como correta"
                              />
                              <Input
                                value={option.texto}
                                onChange={(e) => updateOption(qIndex, oIndex, 'texto', e.target.value)}
                                placeholder={`Opção ${oIndex + 1}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Marque a checkbox para indicar a opção correta
                          </p>
                        </div>
                      </div>

                      {questions.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuestion(qIndex)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
