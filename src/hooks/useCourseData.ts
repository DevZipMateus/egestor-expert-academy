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
  const [answeredSlides, setAnsweredSlides] = useState<Set<number>>(new Set());

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
        .select('aulas_assistidas')
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
    } catch (error) {
      console.error('❌ Erro ao carregar slides respondidos:', error);
    }
  };

  const markSlideAsAnswered = async (slideNumber: number) => {
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

      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('progresso_usuario')
        .select('aulas_assistidas')
        .eq('usuario_id', userId)
        .single();

      const aulasAssistidas = currentProgress?.aulas_assistidas || [];
      console.log('📊 Aulas assistidas atuais:', aulasAssistidas);
      
      // Adicionar o slide se não estiver na lista
      if (!aulasAssistidas.includes(slideNumber)) {
        aulasAssistidas.push(slideNumber);
        console.log('➕ Adicionando slide', slideNumber, 'à lista de assistidas');
        
        // Atualizar no banco
        const { error } = await supabase
          .from('progresso_usuario')
          .update({
            aulas_assistidas: aulasAssistidas,
            data_atualizacao: new Date().toISOString()
          })
          .eq('usuario_id', userId);

        if (error) {
          console.error('❌ Erro ao salvar resposta no banco:', error);
          // Reverter estado local em caso de erro
          setAnsweredSlides(prev => {
            const newSet = new Set(prev);
            newSet.delete(slideNumber);
            return newSet;
          });
        } else {
          console.log('✅ Resposta salva com sucesso no banco para slide:', slideNumber);
          console.log('💾 Aulas assistidas salvas:', aulasAssistidas);
        }
      } else {
        console.log('ℹ️ Slide', slideNumber, 'já estava marcado como respondido');
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
          explanation: null // Static exam questions don't have explanations
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
    answeredSlides,
    getSlideByOrder,
    getQuestionBySlideId,
    getTotalSlidesCount,
    getExamQuestions,
    markSlideAsAnswered
  };
};
