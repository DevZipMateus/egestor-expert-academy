import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import QuestionFormIntegrated from './QuestionFormIntegrated';

interface Question {
  id: string;
  pergunta: string;
  slide_id: number | null;
  explicacao: string | null;
}

interface ModuleQuestionsProps {
  moduleId: string;
  courseId: string;
}

const ModuleQuestions = ({ moduleId, courseId }: ModuleQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    try {
      // Buscar slides do módulo
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('id, titulo, ordem')
        .eq('module_id', moduleId)
        .order('ordem');

      if (slidesError) throw slidesError;
      setSlides(slidesData || []);

      // Buscar perguntas vinculadas aos slides
      const slideIds = (slidesData || []).map(s => s.id);
      if (slideIds.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .in('slide_id', slideIds);

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestion(questionId);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      toast.success('Pergunta excluída com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      toast.error('Erro ao excluir pergunta');
    }
  };

  const getSlideTitleById = (slideId: number | null) => {
    if (!slideId) return 'Não vinculado';
    const slide = slides.find(s => s.id === slideId);
    return slide ? slide.titulo : 'Slide desconhecido';
  };

  if (showQuestionForm) {
    return (
      <QuestionFormIntegrated
        moduleId={moduleId}
        courseId={courseId}
        questionId={editingQuestion || undefined}
        onSave={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
          fetchData();
        }}
        onCancel={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }}
      />
    );
  }

  if (loading) return <div className="text-sm text-muted-foreground">Carregando perguntas...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Perguntas do Módulo</h4>
        <Button size="sm" onClick={handleNewQuestion} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" />
          Nova Pergunta
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma pergunta cadastrada.</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleNewQuestion}
              className="mt-3"
            >
              Criar primeira pergunta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => (
            <Card key={question.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{question.pergunta}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vinculado ao slide: {getSlideTitleById(question.slide_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
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

export default ModuleQuestions;
