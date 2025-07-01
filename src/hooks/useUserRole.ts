
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'student' | null;

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
        // Verificar se é admin pelo email
        if (userEmail === 'mateus.pinto@zipline.com.br') {
          setRole('admin');
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

  return { role, loading, isAdmin: role === 'admin', isStudent: role === 'student' };
};
