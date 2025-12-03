
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'funcionario' | 'student' | null;

export const useUserRole = (userEmail: string | null) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userEmail) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Buscar role do banco de dados
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar role:', error);
          setRole('student');
        } else if (userRole) {
          setRole(userRole.role as UserRole);
        } else {
          setRole('student');
        }
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        setRole('student');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userEmail]);

  return { role, loading, isAdmin: role === 'admin', isFuncionario: role === 'funcionario', isStudent: role === 'student' };
};
