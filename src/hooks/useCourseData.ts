import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSlideById, getTotalSlides } from '@/data/courseData';

// Função Fisher-Yates para embaralhar array de forma eficiente
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface SlideData {
  id: number;
  titulo: string;
  tipo: string;
  conteudo: string | null;
  video_url: string | null;
  image_url: string | null;
  ordem: number;
  module_id: string | null;
  course_id: string | null;
  exam_id: string | null;
  modules?: {
    titulo: string;
    ordem: number;
  } | null;
}

interface QuestionData {
  id: string;
  pergunta: string;
  explicacao: string | null;
  slide_id: number | null;
  options: Array<{
    id: string;
    texto: string;
    correta: boolean;
    ordem: number;
  }>;
}

interface TransformedSlideData {
  id: number;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  question: string | null;
  options: Array<{ text: string; correct: boolean }> | null;
  explanation: string | null;
  examQuestions: Array<{
    question: string;
    options: Array<{ text: string; correct: boolean }>;
    explanation: string | null;
  }> | null;
  examId: string | null;
  timeLimit: number | null;
}

interface ExerciseAnswer {
  selectedOption: number;
  correct: boolean;
}

export const useCourseData = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);
  const [answeredSlides, setAnsweredSlides] = useState<Set<number>>(new Set());
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, ExerciseAnswer>>({});

  useEffect(() => {
    loadCourseData();
    loadAnsweredSlides();
  }, []);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carregamento dos dados do curso Expert eGestor...');
      
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select(`
          *,
          modules (
            titulo,
            ordem
          )
        `)
        .eq('course_id', '550e8400-e29b-41d4-a716-446655440000')
        .eq('ativo', true)
        .order('ordem');

      if (slidesError) {
        console.error('❌ Erro ao carregar slides do Supabase:', slidesError);
        console.log('📦 Usando dados estáticos como fallback');
        setError(slidesError.message);
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      console.log('✅ Slides carregados do Supabase:', slidesData?.length || 0, 'slides encontrados');

      if (!slidesData || slidesData.length === 0) {
        console.log('⚠️ Nenhum slide encontrado no banco de dados');
        console.log('📦 Usando dados estáticos como fallback');
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (
            id,
            texto,
            correta,
            ordem
          )
        `)
        .eq('course_id', '550e8400-e29b-41d4-a716-446655440000')
        .order('slide_id');

      if (questionsError) {
        console.error('❌ Erro ao carregar perguntas:', questionsError);
        setError('Erro ao carregar perguntas');
      } else {
        console.log('✅ Perguntas carregadas:', questionsData?.length || 0, 'perguntas encontradas');
      }

      const processedQuestions = questionsData?.map(q => ({
        ...q,
        options: q.question_options?.sort((a, b) => a.ordem - b.ordem) || []
      })) || [];

      setSlides(slidesData || []);
      setQuestions(processedQuestions);
      setUseStaticData(false);
      console.log('🎉 Dados carregados com sucesso do Supabase!');
      console.log('📊 Total de slides:', slidesData?.length);
      console.log('❓ Total de perguntas:', processedQuestions.length);
      
    } catch (error) {
      console.error('💥 Erro crítico ao carregar dados do curso:', error);
      setError('Erro ao carregar dados do curso');
      setUseStaticData(true);
      console.log('📦 Fallback para dados estáticos ativado');
    } finally {
      setLoading(false);
    }
  };

  const ensureUserExists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return null;
      }

      console.log('✅ Usuário autenticado:', user.id);
      return user.id;
    } catch (error) {
      console.error('💥 Erro crítico ao verificar usuário:', error);
      return null;
    }
  };

  const loadAnsweredSlides = async () => {
    try {
      const userId = await ensureUserExists();
      if (!userId) return;

      console.log('📚 Carregando slides respondidos para usuário:', userId);
      
      const { data: progressData } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas, respostas_exercicios')
        .eq('usuario_id', userId)
        .single();

      if (progressData?.aulas_assistidas) {
        const answered = new Set(progressData.aulas_assistidas);
        setAnsweredSlides(answered);
        console.log('✅ Slides respondidos carregados:', answered.size, 'slides');
        console.log('📋 Lista de slides respondidos:', Array.from(answered));
      } else {
        console.log('ℹ️ Nenhum slide respondido encontrado');
      }

      // Carregar respostas de exercícios
      if (progressData?.respostas_exercicios) {
        const savedAnswers = progressData.respostas_exercicios as unknown as Record<string, ExerciseAnswer>;
        // Converter chaves string para number
        const answersWithNumberKeys: Record<number, ExerciseAnswer> = {};
        Object.entries(savedAnswers).forEach(([key, value]) => {
          answersWithNumberKeys[parseInt(key)] = value;
        });
        setExerciseAnswers(answersWithNumberKeys);
        console.log('✅ Respostas de exercícios carregadas:', Object.keys(answersWithNumberKeys).length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slides respondidos:', error);
    }
  };

  const markSlideAsAnswered = async (slideNumber: number, answer?: { selectedOption: number; correct: boolean }) => {
    try {
      console.log('💾 Iniciando salvamento da resposta do slide:', slideNumber);

      const userId = await ensureUserExists();
      if (!userId) {
        console.error('❌ Não foi possível obter ID do usuário para salvar resposta');
        return;
      }

      // Atualizar estado local imediatamente
      setAnsweredSlides(prev => {
        const newSet = new Set([...prev, slideNumber]);
        console.log('🔄 Estado local atualizado - slides respondidos:', Array.from(newSet));
        return newSet;
      });

      // Atualizar respostas de exercícios localmente se fornecido
      if (answer) {
        setExerciseAnswers(prev => ({
          ...prev,
          [slideNumber]: answer
        }));
      }

      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas, course_id, respostas_exercicios')
        .eq('usuario_id', userId)
        .single();

      const aulasAssistidas = currentProgress?.aulas_assistidas || [];
      const respostasExercicios = (currentProgress?.respostas_exercicios as unknown as Record<string, ExerciseAnswer>) || {};
      
      console.log('📊 Aulas assistidas atuais:', aulasAssistidas);
      
      // Preparar dados para atualização
      const updateData: any = {
        data_atualizacao: new Date().toISOString()
      };
      
      // Adicionar o slide se não estiver na lista
      if (!aulasAssistidas.includes(slideNumber)) {
        aulasAssistidas.push(slideNumber);
        console.log('➕ Adicionando slide', slideNumber, 'à lista de assistidas');
        
        // Calcular progresso percentual (46 slides de conteúdo, exclui introdução e exame)
        const progressoPercentual = Math.round((aulasAssistidas.length / 46) * 100);
        console.log('📊 Progresso percentual calculado:', progressoPercentual, '%');
        
        updateData.aulas_assistidas = aulasAssistidas;
        updateData.progresso_percentual = progressoPercentual;
      }

      // Salvar resposta do exercício se fornecida
      if (answer) {
        respostasExercicios[slideNumber.toString()] = answer;
        updateData.respostas_exercicios = respostasExercicios;
        console.log('💾 Salvando resposta do exercício:', slideNumber, answer);
      }
        
      // Atualizar no banco
      const { error } = await supabase
        .from('progresso_usuario')
        .update(updateData)
        .eq('usuario_id', userId);

      if (error) {
        console.error('❌ Erro ao salvar resposta no banco:', error);
        // Reverter estado local em caso de erro
        setAnsweredSlides(prev => {
          const newSet = new Set(prev);
          newSet.delete(slideNumber);
          return newSet;
        });
        if (answer) {
          setExerciseAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[slideNumber];
            return newAnswers;
          });
        }
      } else {
        console.log('✅ Resposta salva com sucesso no banco para slide:', slideNumber);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao marcar slide como respondido:', error);
      // Reverter estado local em caso de erro
      setAnsweredSlides(prev => {
        const newSet = new Set(prev);
        newSet.delete(slideNumber);
        return newSet;
      });
    }
  };

  const getExerciseAnswer = (slideNumber: number): ExerciseAnswer | null => {
    return exerciseAnswers[slideNumber] || null;
  };

  const getSlideByOrder = (order: number): TransformedSlideData | null => {
    if (useStaticData) {
      console.log('📦 Usando dados estáticos para slide:', order);
      const staticSlide = getSlideById(order);
      if (!staticSlide) return null;
      
      // Transform static slide to match TransformedSlideData interface
      return {
        id: staticSlide.id,
        title: staticSlide.title,
        type: staticSlide.type,
        content: staticSlide.content || null,
        videoUrl: staticSlide.videoUrl || null,
        imageUrl: null,
        question: staticSlide.question || null,
        options: staticSlide.options || null,
        explanation: staticSlide.explanation || null,
        examQuestions: staticSlide.examQuestions ? staticSlide.examQuestions.map(q => ({
          question: q.question,
          options: q.options,
          explanation: null // Static exam questions don't have explanations
        })) : null,
        examId: null, // Static data doesn't have examId
        timeLimit: null // Static data doesn't have timeLimit
      };
    }

    console.log('🔍 Buscando slide', order, 'no banco de dados');
    const slide = slides.find(s => s.ordem === order);
    if (!slide) {
      console.log('❌ Slide', order, 'não encontrado no banco');
      return null;
    }

    console.log('✅ Slide', order, 'encontrado:', slide.titulo);

    // Converter para o formato esperado pelos componentes
    return {
      id: slide.ordem,
      title: slide.titulo,
      type: slide.tipo,
      content: slide.conteudo,
      videoUrl: slide.video_url,
      imageUrl: slide.image_url,
      question: null,
      options: null,
      explanation: null,
      examQuestions: null, // Will be loaded separately in the component
      examId: slide.exam_id,
      timeLimit: null // Will be fetched when exam questions are loaded
    };
  };

  const getQuestionBySlideId = (slideOrder: number) => {
    console.log('🔍 Buscando pergunta para slide ordem:', slideOrder);
    
    // Primeiro encontrar o slide pelo ordem para obter o ID real do banco
    const slide = slides.find(s => s.ordem === slideOrder);
    if (!slide) {
      console.log('❌ Slide não encontrado para ordem:', slideOrder);
      return null;
    }
    
    console.log('🔍 Slide encontrado - ID real:', slide.id, 'Ordem:', slideOrder);
    
    // Agora buscar a pergunta pelo ID real do slide
    const question = questions.find(q => q.slide_id === slide.id);
    if (!question) {
      console.log('❌ Nenhuma pergunta encontrada para slide ID:', slide.id);
      return null;
    }

    console.log('✅ Pergunta encontrada para slide', slideOrder, ':', question.pergunta);
    return {
      question: question.pergunta,
      options: question.options.map(opt => ({
        text: opt.texto,
        correct: opt.correta
      })),
      explanation: question.explicacao
    };
  };

  const getExamQuestions = async (examId?: string) => {
    console.log('📝 Buscando perguntas do exame do banco...', examId || 'default');
    
    try {
      let targetExamId = examId;
      let examTimeLimit: number | null = null;
      
      // Se não forneceu examId, buscar o exame padrão do curso (fallback para compatibilidade)
      if (!examId) {
        const { data: courseExam, error: examError } = await supabase
          .from('course_exams')
          .select('id, randomize_questions, randomize_options, time_limit_minutes')
          .eq('course_id', '550e8400-e29b-41d4-a716-446655440000') // ID do curso Expert eGestor
          .single();

        if (examError || !courseExam) {
          console.error('❌ Erro ao buscar exame padrão:', examError);
          return [];
        }
        
        targetExamId = courseExam.id;
        examTimeLimit = courseExam.time_limit_minutes;
      }

      // Buscar configurações do exame
      const { data: examConfig, error: examConfigError } = await supabase
        .from('course_exams')
        .select('randomize_questions, randomize_options, time_limit_minutes')
        .eq('id', targetExamId)
        .single();

      if (examConfigError) {
        console.error('❌ Erro ao buscar configurações do exame:', examConfigError);
      } else {
        examTimeLimit = examConfig?.time_limit_minutes || null;
      }

      // Buscar perguntas do exame específico
      const { data: examQuestions, error: questionsError } = await supabase
        .from('exam_questions')
        .select(`
          id,
          pergunta,
          ordem,
          exam_question_options (
            id,
            texto,
            correta,
            ordem
          )
        `)
        .eq('exam_id', targetExamId)
        .order('ordem', { ascending: true });

      if (questionsError) {
        console.error('❌ Erro ao buscar perguntas do exame:', questionsError);
        return [];
      }

      let formattedQuestions = examQuestions.map((q: any) => {
        // Ordenar opções pela ordem original
        const sortedOptions = q.exam_question_options
          .sort((a: any, b: any) => a.ordem - b.ordem);
        
        // Aplicar randomização nas opções se configurado
        const options = examConfig?.randomize_options 
          ? shuffleArray(sortedOptions)
          : sortedOptions;

        return {
          id: q.id,
          question: q.pergunta,
          options: options.map((opt: any) => ({
            text: opt.texto,
            correct: opt.correta
          }))
        };
      });

      // Aplicar randomização nas perguntas se configurado
      if (examConfig?.randomize_questions) {
        formattedQuestions = shuffleArray(formattedQuestions);
        console.log('🔀 Ordem das perguntas embaralhada');
      }

      if (examConfig?.randomize_options) {
        console.log('🔀 Ordem das opções embaralhada');
      }

      console.log('✅ Perguntas do exame carregadas:', formattedQuestions.length);
      return formattedQuestions;
    } catch (error) {
      console.error('❌ Erro ao buscar perguntas do exame:', error);
      return [];
    }
  };

  const getExamTimeLimit = async (examId: string): Promise<number | null> => {
    try {
      const { data: examConfig, error } = await supabase
        .from('course_exams')
        .select('time_limit_minutes')
        .eq('id', examId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar tempo limite do exame:', error);
        return null;
      }

      return examConfig?.time_limit_minutes || null;
    } catch (error) {
      console.error('❌ Erro ao buscar tempo limite:', error);
      return null;
    }
  };

  const saveExamAttempt = async (examId: string, score: number, passed: boolean, answers: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.error('❌ Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          user_id: user.id,
          exam_id: examId,
          score,
          passed,
          answers: answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar tentativa de exame:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Tentativa de exame salva:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro ao salvar tentativa de exame:', error);
      return { success: false, error: 'Erro ao salvar tentativa' };
    }
  };

  const getTotalSlidesCount = () => {
    if (useStaticData) {
      console.log('📦 Total de slides (dados estáticos):', getTotalSlides());
      return getTotalSlides();
    }
    // Contar apenas slides de conteúdo (ordem >= 1 e tipo !== 'exam')
    const contentSlides = slides.filter(s => s.ordem >= 1 && s.tipo !== 'exam');
    console.log('📊 Total de slides de conteúdo:', contentSlides.length);
    return contentSlides.length;
  };

  return {
    slides,
    questions,
    loading,
    error,
    useStaticData,
    answeredSlides,
    exerciseAnswers,
    getSlideByOrder,
    getQuestionBySlideId,
    getTotalSlidesCount,
    getExamQuestions,
    getExamTimeLimit,
    saveExamAttempt,
    markSlideAsAnswered,
    getExerciseAnswer
  };
};
