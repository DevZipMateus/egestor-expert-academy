
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import VideoSlide from "@/components/VideoSlide";
import ExerciseSlide from "@/components/ExerciseSlide";
import AttentionSlide from "@/components/AttentionSlide";
import ExamSlide from "@/components/ExamSlide";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CourseSidebar from "@/components/CourseSidebar";
import SettingsDropdown from "@/components/SettingsDropdown";
import CourseDebugInfo from "@/components/CourseDebugInfo";
import { useCourseData } from "@/hooks/useCourseData";
import { useAuth } from "@/contexts/AuthContext";

const Curso = () => {
  const { slide } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [examScore, setExamScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState<boolean>(false);
  const [canAdvance, setCanAdvance] = useState<boolean>(true);
  const [exerciseAnswered, setExerciseAnswered] = useState<boolean>(false);
  const currentSlide = parseInt(slide || '1');
  const prevSlideRef = useRef<number>(currentSlide);
  
  const { 
    loading, 
    error, 
    useStaticData, 
    answeredSlides,
    getSlideByOrder, 
    getQuestionBySlideId, 
    getTotalSlidesCount,
    getExamQuestions,
    saveExamAttempt,
    markSlideAsAnswered
  } = useCourseData();

  const totalSlides = getTotalSlidesCount();
  const currentContent = getSlideByOrder(currentSlide);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Reset navigation control when slide changes - usando dados persistidos
  useEffect(() => {
    const slideChanged = prevSlideRef.current !== currentSlide;
    
    if (slideChanged) {
      console.log('🔄 Slide mudou de', prevSlideRef.current, 'para:', currentSlide, 'Tipo:', currentContent?.type);
      prevSlideRef.current = currentSlide;
      
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
        setCanAdvance(true);
        setExerciseAnswered(false);
        console.log('✅ Slide normal - liberando navegação');
      }
    }
  }, [currentSlide, currentContent?.type, answeredSlides]);

  const goToPrevious = () => {
    if (currentSlide > 1) {
      navigate(`/curso/${currentSlide - 1}`);
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

    if (currentSlide < totalSlides) {
      navigate(`/curso/${currentSlide + 1}`);
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
    
    // Salvar tentativa no banco de dados
    const result = await saveExamAttempt(
      'c7b3e4d5-6789-4abc-def0-123456789012', // ID do exame do curso Expert eGestor
      score,
      passed,
      answers
    );

    if (!result.success) {
      toast.error('Erro ao salvar resultado do exame. Tente novamente.');
      return;
    }

    setExamScore(score);
    setExamPassed(passed);
    setCanAdvance(true);
    
    if (passed) {
      toast.success(`Parabéns! Você foi aprovado com ${score}%! 🎉`);
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
          />
        );
      
      case 'exam':
        return (
          <ExamSlide
            title={currentContent.title}
            getExamQuestions={getExamQuestions}
            onExamComplete={handleExamComplete}
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
    navigate('/curso/1');
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
                  <p className="text-xs md:text-sm font-opensans mt-1 text-white/90">
                    Slide {currentSlide} de {totalSlides}
                    {useStaticData && (
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                        Offline
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <SettingsDropdown user={user as any} />
            </div>
          </header>

          <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8 w-full">
            <CourseDebugInfo />
            
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
                {Array.from({ length: Math.min(totalSlides, 10) }, (_, index) => {
                  const slideNumber = Math.floor((currentSlide - 1) / 10) * 10 + index + 1;
                  if (slideNumber > totalSlides) return null;
                  return (
                    <div
                      key={slideNumber}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                        slideNumber === currentSlide ? 'bg-[#d61c00]' : 'bg-gray-300'
                      }`}
                    />
                  );
                })}
              </div>

              <Button
                onClick={goToNext}
                className={`flex items-center space-x-2 text-white w-full sm:w-auto order-3 ${
                  (currentContent?.type === 'exercise' && !exerciseAnswered) || 
                  (currentContent?.type === 'exam' && !canAdvance) ? 
                  'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-[#d61c00] hover:bg-[#b01800]'
                }`}
                disabled={
                  (currentContent?.type === 'exercise' && !exerciseAnswered) ||
                  (currentContent?.type === 'exam' && !canAdvance) ||
                  (currentSlide === totalSlides && !examPassed)
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
