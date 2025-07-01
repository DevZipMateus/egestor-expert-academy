import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileQuestion, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import QuestionForm from './QuestionForm';
import CourseNavigationInfo from '@/components/CourseNavigationInfo';

interface Question {
  id: string;
  pergunta: string;
  explicacao: string | null;
  slide_id: number | null;
  question_options: {
    id: string;
    texto: string;
    correta: boolean;
    ordem: number;
  }[];
}

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [showNavigationInfo, setShowNavigationInfo] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      toast.error('Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestion(questionId);
    setShowForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
      return;
    }

    try {
      // Primeiro deletar as opções
      const { error: optionsError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);

      if (optionsError) throw optionsError;

      // Depois deletar a pergunta
      const { error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (questionError) throw questionError;

      toast.success('Pergunta excluída com sucesso!');
      fetchQuestions();
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      toast.error('Erro ao excluir pergunta');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handlePreview = (question: Question) => {
    setPreviewQuestion(question);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando perguntas...</div>;
  }

  if (showForm) {
    return (
      <QuestionForm
        questionId={editingQuestion || undefined}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (previewQuestion) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
              Preview da Pergunta
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setPreviewQuestion(null)}
            >
              Fechar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-xl font-semibold text-[#52555b] mb-4 font-opensans">
              {previewQuestion.pergunta}
            </h3>
            
            <div className="space-y-3">
              {previewQuestion.question_options
                .sort((a, b) => a.ordem - b.ordem)
                .map((option, index) => (
                  <div
                    key={option.id}
                    className={`p-3 border-2 rounded-lg ${
                      option.correta 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="font-opensans">
                      {String.fromCharCode(65 + index)}) {option.texto}
                      {option.correta && (
                        <span className="ml-2 text-green-600 font-semibold">✓ Correta</span>
                      )}
                    </span>
                  </div>
                ))}
            </div>

            {previewQuestion.explicacao && (
              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 font-opensans">Explicação:</h4>
                <p className="text-blue-700 text-sm font-opensans leading-relaxed">
                  {previewQuestion.explicacao}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showNavigationInfo) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Como Visualizar o Curso</h3>
          <Button
            variant="outline"
            onClick={() => setShowNavigationInfo(false)}
          >
            Voltar para Perguntas
          </Button>
        </div>
        <CourseNavigationInfo />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Perguntas e Exercícios</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowNavigationInfo(true)}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Como Visualizar o Curso
          </Button>
          <Button 
            onClick={handleNewQuestion}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileQuestion className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhuma pergunta cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Clique em "Nova Pergunta" para começar a criar exercícios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-opensans line-clamp-2">
                      {question.pergunta}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        Slide: {question.slide_id || 'Não associado'}
                      </span>
                      <span>
                        Alternativas: {question.question_options?.length || 0}
                      </span>
                      <span>
                        Resposta correta: {
                          question.question_options?.find(opt => opt.correta)?.texto?.substring(0, 30) + '...' || 'Não definida'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(question)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question.id)}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {question.explicacao && (
                <CardContent>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <strong>Explicação:</strong> {question.explicacao}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
