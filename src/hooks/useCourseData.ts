
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
      console.log('🔄 Iniciando carregamento dos dados do curso...');
      
      // Carregar slides do Supabase
      console.log('📊 Buscando slides no Supabase...');
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
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
      console.log('📋 Primeiros 3 slides:', slidesData?.slice(0, 3));

      // Se não há slides no banco, usar dados estáticos
      if (!slidesData || slidesData.length === 0) {
        console.log('⚠️ Nenhum slide encontrado no banco de dados');
        console.log('📦 Usando dados estáticos como fallback');
        setUseStaticData(true);
        setLoading(false);
        return;
      }

      // Carregar perguntas com opções
      console.log('❓ Buscando perguntas no Supabase...');
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
        console.error('❌ Erro ao carregar perguntas:', questionsError);
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

  const getSlideByOrder = (order: number) => {
    if (useStaticData) {
      console.log('📦 Usando dados estáticos para slide:', order);
      return getSlideById(order);
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
