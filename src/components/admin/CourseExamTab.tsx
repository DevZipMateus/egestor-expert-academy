import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileCheck, Settings, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import ExamQuestionForm from './ExamQuestionForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Exam {
  id: string;
  titulo: string;
  descricao: string | null;
  passing_score: number;
  ordem: number;
  ativo: boolean;
}

interface ExamQuestion {
  id: string;
  pergunta: string;
  ordem: number;
}

interface SortableQuestionItemProps {
  question: ExamQuestion;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableQuestionItem = ({ question, onEdit, onDelete }: SortableQuestionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="hover:bg-muted/50">
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {question.ordem}. {question.pergunta}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
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
              className="h-8 w-8 p-0 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CourseExamTabProps {
  courseId: string;
}

const CourseExamTab = ({ courseId }: CourseExamTabProps) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showExamSettings, setShowExamSettings] = useState(false);
  const [examFormData, setExamFormData] = useState({
    titulo: '',
    descricao: '',
    passing_score: 80,
    ativo: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchExamData();
  }, [courseId]);

  const fetchExamData = async () => {
    try {
      const { data: examData, error: examError } = await supabase
        .from('course_exams')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (examError) throw examError;

      if (examData) {
        setExam(examData);
        setExamFormData({
          titulo: examData.titulo,
          descricao: examData.descricao || '',
          passing_score: examData.passing_score,
          ativo: examData.ativo,
        });

        const { data: questionsData, error: questionsError } = await supabase
          .from('exam_questions')
          .select('id, pergunta, ordem')
          .eq('exam_id', examData.id)
          .order('ordem');

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar exame:', error);
      toast.error('Erro ao carregar exame');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    try {
      const { data, error } = await supabase
        .from('course_exams')
        .insert({
          course_id: courseId,
          titulo: examFormData.titulo || 'Exame Final',
          descricao: examFormData.descricao || null,
          passing_score: examFormData.passing_score,
          ordem: 1,
          ativo: examFormData.ativo,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Exame criado com sucesso!');
      setExam(data);
      setShowExamSettings(false);
    } catch (error) {
      console.error('Erro ao criar exame:', error);
      toast.error('Erro ao criar exame');
    }
  };

  const handleUpdateExam = async () => {
    if (!exam) return;

    try {
      const { error } = await supabase
        .from('course_exams')
        .update({
          titulo: examFormData.titulo,
          descricao: examFormData.descricao || null,
          passing_score: examFormData.passing_score,
          ativo: examFormData.ativo,
        })
        .eq('id', exam.id);

      if (error) throw error;
      
      toast.success('Exame atualizado com sucesso!');
      fetchExamData();
      setShowExamSettings(false);
    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      toast.error('Erro ao atualizar exame');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      toast.success('Pergunta excluída!');
      fetchExamData();
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      toast.error('Erro ao excluir pergunta');
    }
  };

  const handleDeleteExam = async () => {
    if (!exam) return;
    if (!confirm('Tem certeza que deseja excluir este exame? Todas as perguntas e tentativas serão perdidas.')) return;

    try {
      const { error } = await supabase
        .from('course_exams')
        .delete()
        .eq('id', exam.id);

      if (error) throw error;
      toast.success('Exame excluído com sucesso!');
      setExam(null);
      setQuestions([]);
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      toast.error('Erro ao excluir exame');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);

    const newQuestions = arrayMove(questions, oldIndex, newIndex);
    setQuestions(newQuestions);

    // Atualizar ordens no banco de dados
    try {
      const updates = newQuestions.map((question, index) => 
        supabase
          .from('exam_questions')
          .update({ ordem: index + 1 })
          .eq('id', question.id)
      );

      await Promise.all(updates);
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem');
      fetchExamData();
    }
  };

  if (loading) return <div>Carregando exame...</div>;

  if (showQuestionForm && exam) {
    return (
      <ExamQuestionForm
        examId={exam.id}
        questionId={editingQuestion || undefined}
        onSave={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
          fetchExamData();
        }}
        onCancel={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }}
      />
    );
  }

  if (!exam) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Nenhum exame final configurado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie um exame final para avaliar os alunos ao final do curso.
          </p>
          <Button onClick={() => setShowExamSettings(true)} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Exame Final
          </Button>

          {showExamSettings && (
            <Card className="mt-6 text-left">
              <CardHeader>
                <CardTitle>Configurações do Exame</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Título do Exame</Label>
                  <Input
                    value={examFormData.titulo}
                    onChange={(e) => setExamFormData({ ...examFormData, titulo: e.target.value })}
                    placeholder="Ex: Exame Final - Expert eGestor"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={examFormData.descricao}
                    onChange={(e) => setExamFormData({ ...examFormData, descricao: e.target.value })}
                    placeholder="Descrição do exame..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Nota Mínima para Aprovação (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={examFormData.passing_score}
                    onChange={(e) => setExamFormData({ ...examFormData, passing_score: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={examFormData.ativo}
                    onChange={(e) => setExamFormData({ ...examFormData, ativo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Exame ativo</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateExam} className="bg-primary">Criar Exame</Button>
                  <Button variant="outline" onClick={() => setShowExamSettings(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-roboto">{exam.titulo}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={exam.ativo ? "default" : "secondary"}>
                {exam.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowExamSettings(!showExamSettings)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Configurações
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteExam}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir Exame
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {exam.descricao && <p className="text-sm text-muted-foreground">{exam.descricao}</p>}
          <div className="flex items-center gap-4 text-sm">
            <span>Nota mínima: <strong>{exam.passing_score}%</strong></span>
            <span>Total de perguntas: <strong>{questions.length}</strong></span>
          </div>
        </CardContent>
      </Card>

      {showExamSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título do Exame</Label>
              <Input
                value={examFormData.titulo}
                onChange={(e) => setExamFormData({ ...examFormData, titulo: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={examFormData.descricao}
                onChange={(e) => setExamFormData({ ...examFormData, descricao: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Nota Mínima (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={examFormData.passing_score}
                onChange={(e) => setExamFormData({ ...examFormData, passing_score: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={examFormData.ativo}
                onChange={(e) => setExamFormData({ ...examFormData, ativo: e.target.checked })}
                className="w-4 h-4"
              />
              <Label>Exame ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateExam} className="bg-primary">Salvar</Button>
              <Button variant="outline" onClick={() => setShowExamSettings(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Perguntas do Exame</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionForm(true);
              }}
              className="bg-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Pergunta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Nenhuma pergunta cadastrada.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQuestionForm(true)}
              >
                Criar primeira pergunta
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {questions.map((question) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      onEdit={() => {
                        setEditingQuestion(question.id);
                        setShowQuestionForm(true);
                      }}
                      onDelete={() => handleDeleteQuestion(question.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseExamTab;
