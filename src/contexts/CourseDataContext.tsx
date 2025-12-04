import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSlideById, getTotalSlides } from '@/data/courseData';

// Função Fisher-Yates para embaralhar array
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

interface CourseDataContextType {
  slides: SlideData[];
  questions: QuestionData[];
  loading: boolean;
  error: string | null;
  useStaticData: boolean;
  answeredSlides: Set<number>;
  exerciseAnswers: Record<number, ExerciseAnswer>;
  markSlideAsAnswered: (slideNumber: number, answer?: { selectedOption: number; correct: boolean }) => Promise<void>;
  getSlideByOrder: (order: number) => TransformedSlideData | null;
  getQuestionBySlideId: (slideOrder: number) => { question: string; options: Array<{ text: string; correct: boolean }>; explanation: string | null } | null;
  getTotalSlidesCount: () => number;
  getExerciseAnswer: (slideNumber: number) => ExerciseAnswer | null;
  getExamQuestions: (examId?: string) => Promise<any[]>;
  getExamTimeLimit: (examId: string) => Promise<number | null>;
  saveExamAttempt: (examId: string, score: number, passed: boolean, answers: any[]) => Promise<string | null>;
}

const CourseDataContext = createContext<CourseDataContextType | null>(null);

export const CourseDataProvider = ({ children }: { children: ReactNode }) => {
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
        setError(slidesError.message);
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      if (!slidesData || slidesData.length === 0) {
        console.log('⚠️ Nenhum slide encontrado no banco de dados');
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
      }

      const processedQuestions = questionsData?.map(q => ({
        ...q,
        options: q.question_options?.sort((a, b) => a.ordem - b.ordem) || []
      })) || [];

      setSlides(slidesData || []);
      setQuestions(processedQuestions);
      setUseStaticData(false);
      console.log('🎉 Dados carregados com sucesso!');
      
    } catch (error) {
      console.error('💥 Erro crítico ao carregar dados do curso:', error);
      setError('Erro ao carregar dados do curso');
      setUseStaticData(true);
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

      const { data: progressData } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas, respostas_exercicios')
        .eq('usuario_id', userId)
        .single();

      if (progressData?.aulas_assistidas) {
        const answered = new Set(progressData.aulas_assistidas);
        setAnsweredSlides(answered);
        console.log('✅ Slides respondidos carregados:', answered.size);
      }

      if (progressData?.respostas_exercicios) {
        const savedAnswers = progressData.respostas_exercicios as unknown as Record<string, ExerciseAnswer>;
        const answersWithNumberKeys: Record<number, ExerciseAnswer> = {};
        Object.entries(savedAnswers).forEach(([key, value]) => {
          answersWithNumberKeys[parseInt(key)] = value;
        });
        setExerciseAnswers(answersWithNumberKeys);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slides respondidos:', error);
    }
  };

  const markSlideAsAnswered = useCallback(async (slideNumber: number, answer?: { selectedOption: number; correct: boolean }) => {
    try {
      const userId = await ensureUserExists();
      if (!userId) return;

      // Atualizar estado local imediatamente
      setAnsweredSlides(prev => {
        const newSet = new Set([...prev, slideNumber]);
        console.log('🔄 Estado local atualizado - slides respondidos:', Array.from(newSet));
        return newSet;
      });

      if (answer) {
        setExerciseAnswers(prev => ({
          ...prev,
          [slideNumber]: answer
        }));
      }

      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas, respostas_exercicios')
        .eq('usuario_id', userId)
        .single();

      const aulasAssistidas = currentProgress?.aulas_assistidas || [];
      const respostasExercicios = (currentProgress?.respostas_exercicios as unknown as Record<string, ExerciseAnswer>) || {};
      
      const updateData: any = {
        data_atualizacao: new Date().toISOString()
      };
      
      if (!aulasAssistidas.includes(slideNumber)) {
        aulasAssistidas.push(slideNumber);
        const progressoPercentual = Math.round((aulasAssistidas.length / 46) * 100);
        updateData.aulas_assistidas = aulasAssistidas;
        updateData.progresso_percentual = progressoPercentual;
        console.log('📊 Progresso atualizado:', progressoPercentual, '%');
      }

      if (answer) {
        respostasExercicios[slideNumber.toString()] = answer;
        updateData.respostas_exercicios = respostasExercicios;
      }
        
      const { error } = await supabase
        .from('progresso_usuario')
        .update(updateData)
        .eq('usuario_id', userId);

      if (error) {
        console.error('❌ Erro ao salvar resposta:', error);
        // Reverter estado local
        setAnsweredSlides(prev => {
          const newSet = new Set(prev);
          newSet.delete(slideNumber);
          return newSet;
        });
      } else {
        console.log('✅ Progresso salvo para slide:', slideNumber);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao marcar slide:', error);
    }
  }, []);

  const getExerciseAnswer = useCallback((slideNumber: number): ExerciseAnswer | null => {
    return exerciseAnswers[slideNumber] || null;
  }, [exerciseAnswers]);

  const getSlideByOrder = useCallback((order: number): TransformedSlideData | null => {
    if (useStaticData) {
      const staticSlide = getSlideById(order);
      if (!staticSlide) return null;
      
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
          explanation: null
        })) : null,
        examId: null,
        timeLimit: null
      };
    }

    const slide = slides.find(s => s.ordem === order);
    if (!slide) return null;

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
      examQuestions: null,
      examId: slide.exam_id,
      timeLimit: null
    };
  }, [slides, useStaticData]);

  const getQuestionBySlideId = useCallback((slideOrder: number) => {
    const slide = slides.find(s => s.ordem === slideOrder);
    if (!slide) return null;
    
    const question = questions.find(q => q.slide_id === slide.id);
    if (!question) return null;

    return {
      question: question.pergunta,
      options: question.options.map(opt => ({
        text: opt.texto,
        correct: opt.correta
      })),
      explanation: question.explicacao
    };
  }, [slides, questions]);

  const getTotalSlidesCount = useCallback(() => {
    if (useStaticData) return getTotalSlides();
    console.log('📊 Total de slides de conteúdo:', 46);
    return 46;
  }, [useStaticData]);

  const getExamQuestions = useCallback(async (examId?: string) => {
    try {
      let targetExamId = examId;
      
      if (!examId) {
        const { data: courseExam, error: examError } = await supabase
          .from('course_exams')
          .select('id, randomize_questions, randomize_options, time_limit_minutes')
          .eq('course_id', '550e8400-e29b-41d4-a716-446655440000')
          .single();

        if (examError || !courseExam) return [];
        targetExamId = courseExam.id;
      }

      const { data: examConfig } = await supabase
        .from('course_exams')
        .select('randomize_questions, randomize_options, time_limit_minutes')
        .eq('id', targetExamId)
        .single();

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

      if (questionsError) return [];

      let formattedQuestions = examQuestions.map((q: any) => {
        const sortedOptions = q.exam_question_options.sort((a: any, b: any) => a.ordem - b.ordem);
        const options = examConfig?.randomize_options ? shuffleArray(sortedOptions) : sortedOptions;

        return {
          id: q.id,
          question: q.pergunta,
          options: options.map((opt: any) => ({
            text: opt.texto,
            correct: opt.correta
          }))
        };
      });

      if (examConfig?.randomize_questions) {
        formattedQuestions = shuffleArray(formattedQuestions);
      }

      return formattedQuestions;
    } catch (error) {
      console.error('❌ Erro ao buscar perguntas do exame:', error);
      return [];
    }
  }, []);

  const getExamTimeLimit = useCallback(async (examId: string): Promise<number | null> => {
    try {
      const { data: examConfig, error } = await supabase
        .from('course_exams')
        .select('time_limit_minutes')
        .eq('id', examId)
        .single();

      if (error || !examConfig) return null;
      return examConfig.time_limit_minutes;
    } catch (error) {
      return null;
    }
  }, []);

  const saveExamAttempt = useCallback(async (examId: string, score: number, passed: boolean, answers: any[]): Promise<string | null> => {
    try {
      const userId = await ensureUserExists();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          user_id: userId,
          exam_id: examId,
          score,
          passed,
          answers,
          completed_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erro ao salvar tentativa de exame:', error);
        return null;
      }

      console.log('✅ Tentativa de exame salva:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Erro ao salvar tentativa:', error);
      return null;
    }
  }, []);

  return (
    <CourseDataContext.Provider value={{
      slides,
      questions,
      loading,
      error,
      useStaticData,
      answeredSlides,
      exerciseAnswers,
      markSlideAsAnswered,
      getSlideByOrder,
      getQuestionBySlideId,
      getTotalSlidesCount,
      getExerciseAnswer,
      getExamQuestions,
      getExamTimeLimit,
      saveExamAttempt
    }}>
      {children}
    </CourseDataContext.Provider>
  );
};

export const useCourseDataContext = () => {
  const context = useContext(CourseDataContext);
  if (!context) {
    throw new Error('useCourseDataContext must be used within a CourseDataProvider');
  }
  return context;
};
