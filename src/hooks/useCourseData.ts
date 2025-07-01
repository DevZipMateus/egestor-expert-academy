
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { courseSlides, getTotalSlides, getSlideById } from '@/data/courseData';

interface SlideData {
  id: number;
  titulo: string;
  tipo: string;
  conteudo: string | null;
  video_url: string | null;
  ordem: number;
  module_id: string | null;
  course_id: string | null;
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

export const useCourseData = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Carregar slides do Supabase
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .order('ordem');

      if (slidesError) {
        console.error('Erro ao carregar slides:', slidesError);
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      // Carregar perguntas com opções
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
        .order('slide_id');

      if (questionsError) {
        console.error('Erro ao carregar perguntas:', questionsError);
      }

      // Processar perguntas para o formato esperado
      const processedQuestions = questionsData?.map(q => ({
        ...q,
        options: q.question_options?.sort((a, b) => a.ordem - b.ordem) || []
      })) || [];

      setSlides(slidesData || []);
      setQuestions(processedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do curso:', error);
      setError('Erro ao carregar dados do curso');
      setUseStaticData(true);
      setLoading(false);
    }
  };

  const getSlideByOrder = (order: number) => {
    if (useStaticData) {
      return getSlideById(order);
    }

    const slide = slides.find(s => s.ordem === order);
    if (!slide) return null;

    // Converter para o formato esperado pelos componentes
    return {
      id: slide.ordem,
      title: slide.titulo,
      type: slide.tipo,
      content: slide.conteudo,
      videoUrl: slide.video_url,
      question: null,
      options: null,
      explanation: null,
      examQuestions: slide.tipo === 'exam' ? getExamQuestions() : null
    };
  };

  const getQuestionBySlideId = (slideId: number) => {
    const question = questions.find(q => q.slide_id === slideId);
    if (!question) return null;

    return {
      question: question.pergunta,
      options: question.options.map(opt => ({
        text: opt.texto,
        correct: opt.correta
      })),
      explanation: question.explicacao
    };
  };

  const getExamQuestions = () => {
    return questions.map(q => ({
      question: q.pergunta,
      options: q.options.map(opt => ({
        text: opt.texto,
        correct: opt.correta
      })),
      explanation: q.explicacao
    }));
  };

  const getTotalSlidesCount = () => {
    if (useStaticData) {
      return getTotalSlides();
    }
    return slides.length;
  };

  return {
    slides,
    questions,
    loading,
    error,
    useStaticData,
    getSlideByOrder,
    getQuestionBySlideId,
    getTotalSlidesCount,
    getExamQuestions
  };
};
