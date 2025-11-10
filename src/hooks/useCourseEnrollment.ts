import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCourseEnrollment = () => {
  const [loading, setLoading] = useState(false);

  const enrollInCourse = async (courseId: string, userId: string) => {
    setLoading(true);
    try {
      // Verificar se já existe progresso para este curso
      const { data: existingProgress } = await supabase
        .from('progresso_usuario')
        .select('id')
        .eq('usuario_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingProgress) {
        console.log('Usuário já está inscrito neste curso');
        return { success: true, alreadyEnrolled: true };
      }

      // Criar registro de progresso para o curso
      const { error } = await supabase
        .from('progresso_usuario')
        .insert({
          usuario_id: userId,
          course_id: courseId,
          aulas_assistidas: [],
          progresso_percentual: 0,
          started_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao inscrever no curso:', error);
        return { success: false, error: error.message };
      }

      console.log('Usuário inscrito no curso com sucesso');
      return { success: true, alreadyEnrolled: false };
    } catch (error) {
      console.error('Erro ao inscrever no curso:', error);
      return { success: false, error: 'Erro ao inscrever no curso' };
    } finally {
      setLoading(false);
    }
  };

  const getCourseProgress = async (courseId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar progresso:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return null;
    }
  };

  return {
    loading,
    enrollInCourse,
    getCourseProgress
  };
};
