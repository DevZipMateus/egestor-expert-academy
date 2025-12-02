
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import VideoSlide from "@/components/VideoSlide";
import ExerciseSlide from "@/components/ExerciseSlide";
import AttentionSlide from "@/components/AttentionSlide";
import ExamSlide from "@/components/ExamSlide";
import IntroEgestorSlide from "@/components/IntroEgestorSlide";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CourseSidebar from "@/components/CourseSidebar";
import SettingsDropdown from "@/components/SettingsDropdown";

import { useCourseData } from "@/hooks/useCourseData";
import { useAuth } from "@/contexts/AuthContext";

const Curso = () => {
  const { courseId, slide } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examScore, setExamScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState<boolean>(false);
  const [canAdvance, setCanAdvance] = useState<boolean>(true);
  const [exerciseAnswered, setExerciseAnswered] = useState<boolean>(false);
  const [examTimeLimit, setExamTimeLimit] = useState<number | null>(null);
  const currentSlide = parseInt(slide || '1');
  const prevSlideRef = useRef<number>(currentSlide);
  
  const { 
    slides,
    loading, 
    error, 
    useStaticData, 
    answeredSlides,
    getSlideByOrder, 
    getQuestionBySlideId, 
    getTotalSlidesCount,
    getExamQuestions,
    getExamTimeLimit,
    saveExamAttempt,
    markSlideAsAnswered
  } = useCourseData();

  const totalSlides = getTotalSlidesCount();
  const currentContent = getSlideByOrder(currentSlide);

  // Verificar se o exame está acessível (todas as 43 aulas de conteúdo completadas)
  const isExamAccessible = () => {
    // Slides 1-43 são conteúdo, 44 é o exame, 0 é introdução
    const contentSlides = Array.from({ length: 43 }, (_, i) => i + 1);
    return contentSlides.every(slideNum => answeredSlides.has(slideNum));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Verificar se há curso pendente após login
    const pendingCourseId = localStorage.getItem('pendingCourseId');
    if (pendingCourseId && user) {
      localStorage.removeItem('pendingCourseId');
      // Inscrever usuário no curso se ainda não estiver inscrito
      enrollUserInCourse(pendingCourseId, user.id);
    }
  }, [isAuthenticated, navigate, user]);

  // Verificar acesso ao exame ao tentar acessar slide de exame
  useEffect(() => {
    if (currentContent?.type === 'exam' && !isExamAccessible()) {
      console.log('🚫 Acesso ao exame bloqueado - nem todos os slides foram completados');
      toast.error('Complete todos os slides anteriores para acessar o exame final.');
      
      // Encontrar o próximo slide não completado
      const nextIncompleteSlide = Array.from({ length: 43 }, (_, i) => i + 1)
        .find(slideNum => !answeredSlides.has(slideNum)) || 1;
      
      navigate(`/curso/${courseId}/${nextIncompleteSlide}`);
    }
  }, [currentSlide, currentContent?.type, answeredSlides, courseId, navigate]);

  const enrollUserInCourse = async (courseId: string, userId: string) => {
    try {
      const { data: existingProgress } = await supabase
        .from('progresso_usuario')
        .select('id')
        .eq('usuario_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (!existingProgress) {
        await supabase
          .from('progresso_usuario')
          .insert({
            usuario_id: userId,
            course_id: courseId,
            aulas_assistidas: [],
            progresso_percentual: 0,
            started_at: new Date().toISOString()
          });
        console.log('Usuário inscrito no curso com sucesso');
      }
    } catch (error) {
      console.error('Erro ao inscrever usuário no curso:', error);
    }
  };

  // Reset navigation control when slide changes - usando dados persistidos
  useEffect(() => {
    // Log para debug
    console.log('🔄 Verificando navegação para slide:', currentSlide, 'Tipo:', currentContent?.type);
    
    // Atualizar referência do slide anterior
    prevSlideRef.current = currentSlide;
    
    // Verificar se o slide já foi respondido
    const slideWasAnswered = answeredSlides.has(currentSlide);
    console.log('🔍 Verificando se slide', currentSlide, 'foi respondido:', slideWasAnswered);
    
    if (currentContent?.type === 'exercise') {
      if (slideWasAnswered) {
        console.log('✅ Exercício já foi respondido anteriormente - liberando navegação');
        setCanAdvance(true);
        setExerciseAnswered(true);
      } else {
        console.log('🚫 Exercício detectado - bloqueando navegação');
        setCanAdvance(false);
        setExerciseAnswered(false);
      }
    } else if (currentContent?.type === 'exam') {
      setCanAdvance(false);
      console.log('🚫 Exame detectado - bloqueando navegação');
    } else {
      // Para video, content, attention - sempre permite avançar
      setCanAdvance(true);
      setExerciseAnswered(false);
      console.log('✅ Slide normal - liberando navegação');
    }
  }, [currentSlide, currentContent?.type, answeredSlides]);

  // Buscar time limit quando o exame mudar
  useEffect(() => {
    const fetchExamTimeLimit = async () => {
      if (currentContent?.type === 'exam' && currentContent.examId) {
        const timeLimit = await getExamTimeLimit(currentContent.examId);
        setExamTimeLimit(timeLimit);
        console.log('⏱️ Tempo limite do exame:', timeLimit ? `${timeLimit} minutos` : 'Sem limite');
      } else {
        setExamTimeLimit(null);
      }
    };

    fetchExamTimeLimit();
  }, [currentContent?.examId, currentContent?.type, getExamTimeLimit]);

  const goToPrevious = () => {
    // Encontrar slide anterior na lista ordenada
    const sortedSlides = [...slides].sort((a, b) => a.ordem - b.ordem);
    const currentIndex = sortedSlides.findIndex(s => s.ordem === currentSlide);
    
    if (currentIndex > 0) {
      const prevSlide = sortedSlides[currentIndex - 1];
      navigate(`/curso/${courseId}/${prevSlide.ordem}`);
    } else {
      navigate('/dashboard');
    }
  };

  const goToNext = () => {
    console.log('🔍 Tentativa de avançar - canAdvance:', canAdvance, 'exerciseAnswered:', exerciseAnswered);
    
    if (currentContent?.type === 'exercise' && !exerciseAnswered) {
      toast.error("Você precisa responder a pergunta antes de continuar.");
      return;
    }

    if (!canAdvance && currentContent?.type === 'exam') {
      toast.error("Você precisa completar o exame antes de continuar.");
      return;
    }

    // Encontrar próximo slide na lista ordenada
    const sortedSlides = [...slides].sort((a, b) => a.ordem - b.ordem);
    const currentIndex = sortedSlides.findIndex(s => s.ordem === currentSlide);
    
    if (currentIndex < sortedSlides.length - 1) {
      const nextSlide = sortedSlides[currentIndex + 1];
      
      // Verificar se o próximo slide é o exame e se está bloqueado
      if (nextSlide.tipo === 'exam' && !isExamAccessible()) {
        toast.error("Complete todos os slides anteriores para acessar o exame final.");
        return;
      }
      
      navigate(`/curso/${courseId}/${nextSlide.ordem}`);
    } else {
      if (examPassed) {
        navigate('/expert');
      } else {
        toast.error("Você precisa ser aprovado no exame para continuar.");
      }
    }
  };

  const handleExerciseAnswer = async (correct: boolean) => {
    console.log('📝 Resposta do exercício recebida:', correct);
    
    // Salvar no banco de dados usando o sistema unificado
    await markSlideAsAnswered(currentSlide);
    
    setExerciseAnswered(true);
    setCanAdvance(true);
    
    if (correct) {
      toast.success("Resposta correta! 🎉");
    } else {
      toast.error("Resposta incorreta. Revise o conteúdo.");
    }
    
    console.log('✅ Navegação liberada após resposta para slide:', currentSlide);
  };

  const handleExamComplete = async (score: number, passed: boolean, answers: any[]) => {
    console.log('🎯 Exame completado:', score, 'passou:', passed);
    
    // Buscar o examId do slide atual
    const examId = currentContent?.examId;
    
    if (!examId) {
      console.error('❌ examId não encontrado no slide atual');
      toast.error('Erro ao identificar o exame. Tente novamente.');
      return;
    }

    // Salvar tentativa no banco de dados
    const result = await saveExamAttempt(
      examId,
      score,
      passed,
      answers
    );

    if (!result.success) {
      toast.error('Erro ao salvar resultado do exame. Tente novamente.');
      return;
    }

    const examAttemptId = result.data?.id;

    setExamScore(score);
    setExamPassed(passed);
    setCanAdvance(true);
    
    if (passed) {
      toast.success(`Parabéns! Você foi aprovado com ${score}%! 🎉`);
      
      // Gerar certificado automaticamente
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ examAttemptId }),
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificado-${examAttemptId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('Seu certificado foi gerado e baixado automaticamente! 📜');
        } else {
          console.error('Erro ao gerar certificado:', await response.text());
        }
      } catch (error) {
        console.error('Erro ao gerar certificado:', error);
      }
    } else {
      toast.error(`Você obteve ${score}%. É necessário 80% para aprovação.`);
    }
  };

  const renderSlideContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Carregando curso...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 p-3 md:p-4 rounded-lg">
          <p className="text-red-800 text-sm md:text-base">Erro ao carregar o curso. Tentando usar dados locais...</p>
        </div>
      );
    }

    if (!currentContent) return null;

    // Slide especial de introdução "O que é o eGestor?"
    if (currentSlide === -1) {
      return <IntroEgestorSlide />;
    }

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
      case 'video':
        return (
          <VideoSlide 
            title={currentContent.title}
            videoUrl={currentContent.videoUrl || ''}
          />
        );
      
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
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto text-center px-4">
                {currentContent.title}
              </h2>
              <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border text-center">
                <p className="text-base md:text-lg text-[#52555b] font-opensans leading-relaxed">
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
            imageUrl={currentContent.imageUrl}
          />
        );
      
      case 'exam':
        return (
          <ExamSlide
            title={currentContent.title}
            getExamQuestions={() => getExamQuestions(currentContent.examId || undefined)}
            onExamComplete={handleExamComplete}
            timeLimit={examTimeLimit}
          />
        );
      
      case 'final':
        return (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto text-center px-4">
              {examPassed ? 'Você concluiu o curso!' : 'Infelizmente você não passou'}
            </h2>
            <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border text-center">
              <p className="text-base md:text-lg text-[#52555b] font-opensans">
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
    // Redirecionar para o primeiro slide de introdução
    navigate(`/curso/${courseId}/-2`);
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full" style={{ backgroundColor: '#f7f7f7' }}>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        <CourseSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-[#d61c00] shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <SidebarTrigger className="text-white hover:bg-white/20 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold font-roboto text-white truncate">
                    Expert eGestor
                  </h1>
                  {currentSlide >= 1 && (
                    <p className="text-xs md:text-sm font-opensans mt-1 text-white/90">
                      Slide {currentSlide} de {totalSlides}
                      {useStaticData && (
                        <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                          Offline
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <SettingsDropdown user={user as any} />
            </div>
          </header>

          <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8 w-full">
            
            <div className="rounded-lg p-3 md:p-8" style={{ backgroundColor: '#f7f7f7' }}>
              {renderSlideContent()}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 md:mt-8 gap-4">
              <Button
                onClick={goToPrevious}
                variant="outline"
                className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
                style={{ color: '#52555b', borderColor: '#52555b' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm md:text-base">ANTERIOR</span>
              </Button>

              <div className="flex space-x-1 md:space-x-2 order-1 sm:order-2 overflow-x-auto pb-2 sm:pb-0">
                {(() => {
                  // Filtrar apenas slides de conteúdo (ordem >= 1)
                  const contentSlides = slides.filter(s => s.ordem >= 1).sort((a, b) => a.ordem - b.ordem);
                  const totalContent = contentSlides.length;
                  const currentContentIndex = contentSlides.findIndex(s => s.ordem === currentSlide);
                  const currentPage = currentContentIndex >= 0 ? Math.floor(currentContentIndex / 10) : 0;
                  
                  return Array.from({ length: Math.min(totalContent, 10) }, (_, index) => {
                    const slideIndex = currentPage * 10 + index;
                    if (slideIndex >= totalContent) return null;
                    const isActive = slideIndex === currentContentIndex;
                    return (
                      <div
                        key={slideIndex}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                          isActive ? 'bg-[#d61c00]' : 'bg-gray-300'
                        }`}
                      />
                    );
                  });
                })()}
              </div>

              <Button
                onClick={goToNext}
                className={`flex items-center space-x-2 text-white w-full sm:w-auto order-3 ${
                  (currentContent?.type === 'exercise' && !exerciseAnswered) || 
                  (currentContent?.type === 'exam' && !canAdvance) ? 
                  'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-[#d61c00] hover:bg-[#b01800]'
                }`}
                disabled={
                  loading ||
                  (currentContent?.type === 'exercise' && !exerciseAnswered) ||
                  (currentContent?.type === 'exam' && !canAdvance) ||
                  (currentSlide === totalSlides && currentContent?.type === 'exam' && !examPassed)
                }
              >
                <span className="text-sm md:text-base">
                  {currentSlide === totalSlides ? 'FINALIZAR' : 'PRÓXIMO'}
                </span>
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
