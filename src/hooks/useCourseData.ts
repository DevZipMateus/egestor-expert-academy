
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSlideById, getTotalSlides } from '@/data/courseData';

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

// Interface for transformed slide data used by components
interface TransformedSlideData {
  id: number;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  question: string | null;
  options: Array<{ text: string; correct: boolean }> | null;
  explanation: string | null;
  examQuestions: Array<{
    question: string;
    options: Array<{ text: string; correct: boolean }>;
    explanation: string | null;
  }> | null;
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
      console.log('🔄 Iniciando carregamento dos dados do curso Expert eGestor...');
      
      // Carregar slides do curso Expert eGestor
      console.log('📊 Buscando slides do curso Expert eGestor...');
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
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

      // Se não há slides no banco, usar dados estáticos
      if (!slidesData || slidesData.length === 0) {
        console.log('⚠️ Nenhum slide encontrado no banco de dados');
        console.log('📦 Usando dados estáticos como fallback');
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      // Carregar perguntas com opções do curso Expert eGestor
      console.log('❓ Buscando perguntas do curso Expert eGestor...');
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

      // Processar perguntas para o formato esperado
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
        question: staticSlide.question || null,
        options: staticSlide.options || null,
        explanation: staticSlide.explanation || null,
        examQuestions: staticSlide.examQuestions ? staticSlide.examQuestions.map(q => ({
          question: q.question,
          options: q.options,
          explanation: q.explanation || null
        })) : null
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
      question: null,
      options: null,
      explanation: null,
      examQuestions: slide.tipo === 'exam' ? getExamQuestions() : null
    };
  };

  const getQuestionBySlideId = (slideId: number) => {
    console.log('🔍 Buscando pergunta para slide ID:', slideId);
    const question = questions.find(q => q.slide_id === slideId);
    if (!question) {
      console.log('❌ Nenhuma pergunta encontrada para slide:', slideId);
      return null;
    }

    console.log('✅ Pergunta encontrada para slide', slideId, ':', question.pergunta);
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
    console.log('📝 Gerando perguntas do exame final...');
    const examQuestions = questions.map(q => ({
      question: q.pergunta,
      options: q.options.map(opt => ({
        text: opt.texto,
        correct: opt.correta
      })),
      explanation: q.explicacao || null
    }));
    console.log('✅ Perguntas do exame:', examQuestions.length);
    return examQuestions;
  };

  const getTotalSlidesCount = () => {
    if (useStaticData) {
      console.log('📦 Total de slides (dados estáticos):', getTotalSlides());
      return getTotalSlides();
    }
    console.log('📊 Total de slides (banco de dados):', slides.length);
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
