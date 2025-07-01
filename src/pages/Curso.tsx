
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VideoSlide from "@/components/VideoSlide";
import ExerciseSlide from "@/components/ExerciseSlide";
import AttentionSlide from "@/components/AttentionSlide";
import ExamSlide from "@/components/ExamSlide";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CourseSidebar from "@/components/CourseSidebar";
import SettingsDropdown from "@/components/SettingsDropdown";
import { useCourseData } from "@/hooks/useCourseData";
import { useAuth } from "@/contexts/AuthContext";

const Curso = () => {
  const { slide } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examScore, setExamScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState<boolean>(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const currentSlide = parseInt(slide || '1');
  
  const { 
    loading, 
    error, 
    useStaticData, 
    getSlideByOrder, 
    getQuestionBySlideId, 
    getTotalSlidesCount 
  } = useCourseData();

  const totalSlides = getTotalSlidesCount();
  const currentContent = getSlideByOrder(currentSlide);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Criar ou encontrar usuário no Supabase para tracking de progresso
    createOrFindSupabaseUser();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (supabaseUserId && currentSlide) {
      updateProgress(currentSlide);
    }
  }, [supabaseUserId, currentSlide]);

  const createOrFindSupabaseUser = async () => {
    if (!user) return;

    try {
      // Primeiro, verificar se o usuário já existe na tabela usuarios
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        setSupabaseUserId(existingUser.id);
        return;
      }

      // Se não existir, criar novo usuário
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert([{
          nome: user.nome,
          email: user.email
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao criar usuário no Supabase:', error);
        return;
      }

      if (newUser) {
        setSupabaseUserId(newUser.id);
        
        // Criar registro de progresso
        await supabase
          .from('progresso_usuario')
          .insert([{
            usuario_id: newUser.id
          }]);
      }
    } catch (error) {
      console.error('Erro ao gerenciar usuário no Supabase:', error);
    }
  };

  const updateProgress = async (aulaAtual: number) => {
    if (!supabaseUserId) return;

    try {
      const { data: currentProgress } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas')
        .eq('usuario_id', supabaseUserId)
        .single();

      const aulasAssistidas = currentProgress?.aulas_assistidas || [];
      
      if (!aulasAssistidas.includes(aulaAtual)) {
        aulasAssistidas.push(aulaAtual);
      }

      const progressoPercentual = (aulasAssistidas.length / totalSlides) * 100;

      const { error } = await supabase
        .from('progresso_usuario')
        .update({
          ultima_aula: aulaAtual,
          aulas_assistidas: aulasAssistidas,
          progresso_percentual: progressoPercentual,
          data_atualizacao: new Date().toISOString()
        })
        .eq('usuario_id', supabaseUserId);

      if (error) {
        console.error('Erro ao atualizar progresso:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 1) {
      navigate(`/curso/${currentSlide - 1}`);
    } else {
      navigate('/dashboard');
    }
  };

  const goToNext = () => {
    if (currentSlide < totalSlides) {
      navigate(`/curso/${currentSlide + 1}`);
    } else {
      // Curso finalizado
      if (examPassed) {
        navigate('/expert');
      } else {
        toast.error("Você precisa ser aprovado no exame para continuar.");
      }
    }
  };

  const handleExerciseAnswer = (correct: boolean) => {
    if (correct) {
      toast.success("Resposta correta! 🎉");
    } else {
      toast.error("Resposta incorreta. Revise o conteúdo.");
    }
  };

  const handleExamComplete = (score: number, passed: boolean) => {
    setExamScore(score);
    setExamPassed(passed);
    
    if (passed) {
      toast.success(`Parabéns! Você foi aprovado com ${score}%! 🎉`);
    } else {
      toast.error(`Você obteve ${score}%. É necessário 80% para aprovação.`);
    }
  };

  const renderSlideContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 ml-4">Carregando curso...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">Erro ao carregar o curso. Tentando usar dados locais...</p>
        </div>
      );
    }

    if (!currentContent) return null;

    // Para slides de exercício, buscar pergunta específica
    if (currentContent.type === 'exercise') {
      const questionData = getQuestionBySlideId(currentSlide);
      if (questionData) {
        return (
          <ExerciseSlide
            title={currentContent.title}
            question={questionData.question}
            options={questionData.options}
            explanation={questionData.explanation}
            onAnswer={handleExerciseAnswer}
          />
        );
      }
    }

    switch (currentContent.type) {
      case 'content':
        if (currentContent.videoUrl) {
          return (
            <VideoSlide 
              title={currentContent.title}
              videoUrl={currentContent.videoUrl}
            />
          );
        } else {
          return (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#52555b] font-roboto text-center">
                {currentContent.title}
              </h2>
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <p className="text-lg text-[#52555b] font-opensans leading-relaxed">
                  {currentContent.content}
                </p>
              </div>
            </div>
          );
        }
      
      case 'attention':
        return (
          <AttentionSlide
            title={currentContent.title}
            content={currentContent.content || 'Preste atenção nas próximas informações importantes.'}
          />
        );
      
      case 'exam':
        return (
          <ExamSlide
            title={currentContent.title}
            questions={currentContent.examQuestions!}
            onExamComplete={handleExamComplete}
          />
        );
      
      case 'final':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#52555b] font-roboto text-center">
              {examPassed ? 'Você concluiu o curso!' : 'Infelizmente você não passou'}
            </h2>
            <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
              <p className="text-lg text-[#52555b] font-opensans">
                {examPassed 
                  ? 'Parabéns! Você é agora um Expert em eGestor!'
                  : 'Revise o conteúdo e tente novamente o exame.'
                }
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!currentContent && !loading) {
    navigate('/curso/1');
    return null;
  }

  // Mostrar loading se ainda não temos usuário autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#f7f7f7' }}>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        <CourseSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-[#d61c00] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-white/20" />
                <div>
                  <h1 className="text-2xl font-bold font-roboto text-white">
                    Expert eGestor
                  </h1>
                  <p className="text-sm font-opensans mt-1 text-white/90">
                    Slide {currentSlide} de {totalSlides}
                    {useStaticData && (
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                        Modo Offline
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <SettingsDropdown user={user as any} />
            </div>
          </header>

          <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-lg p-8" style={{ backgroundColor: '#f7f7f7' }}>
              {renderSlideContent()}
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={goToPrevious}
                variant="outline"
                className="flex items-center space-x-2"
                style={{ color: '#52555b', borderColor: '#52555b' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ANTERIOR</span>
              </Button>

              <div className="flex space-x-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index + 1 === currentSlide ? 'bg-[#d61c00]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={goToNext}
                className="flex items-center space-x-2 text-white"
                style={{ backgroundColor: '#d61c00' }}
                disabled={currentSlide === totalSlides && !examPassed}
              >
                <span>{currentSlide === totalSlides ? 'FINALIZAR' : 'PRÓXIMO'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Curso;
