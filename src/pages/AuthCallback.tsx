import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const EXPERT_EGESTOR_COURSE_ID = '550e8400-e29b-41d4-a716-446655440000';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for tokens in URL hash (Magic Link flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          console.log('[AuthCallback] Processing tokens from hash...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          // Clear hash from URL
          window.history.replaceState(null, '', window.location.pathname);

          if (error) {
            console.error('[AuthCallback] Error setting session:', error);
            setError('Erro ao processar autenticação. Tente novamente.');
            return;
          }

          if (data.session?.user) {
            await redirectUser(data.session.user.id);
          }
          return;
        }

        // Check for PKCE code in query params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          console.log('[AuthCallback] Exchanging PKCE code...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('[AuthCallback] Error exchanging code:', error);
            setError('Erro ao processar autenticação. Tente novamente.');
            return;
          }

          if (data.session?.user) {
            await redirectUser(data.session.user.id);
          }
          return;
        }

        // No tokens or code found - check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await redirectUser(session.user.id);
        } else {
          console.log('[AuthCallback] No session found, redirecting to auth...');
          navigate('/auth', { replace: true });
        }

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError('Erro inesperado. Tente novamente.');
      }
    };

    const redirectUser = async (userId: string) => {
      // Check for pending course
      const pendingCourseId = localStorage.getItem('pendingCourseId');
      const pendingSlideNumber = localStorage.getItem('pendingSlideNumber') || '1';
      
      if (pendingCourseId) {
        localStorage.removeItem('pendingCourseId');
        localStorage.removeItem('pendingSlideNumber');
        console.log('[AuthCallback] Redirecting to pending course:', pendingCourseId);
        navigate(`/curso/${pendingCourseId}/${pendingSlideNumber}`, { replace: true });
        return;
      }

      // Check user role for redirect
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const role = userRole?.role || 'user';
      console.log('[AuthCallback] User role:', role);

      if (role === 'user') {
        navigate(`/curso/${EXPERT_EGESTOR_COURSE_ID}/1`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,95%)]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/auth')} 
            className="text-[hsl(4,86%,55%)] underline"
          >
            Voltar para login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,95%)]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[hsl(4,86%,55%)] animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[hsl(0,0%,25%)] mb-2">
          Confirmando seu acesso...
        </h1>
        <p className="text-[hsl(0,0%,45%)]">Por favor, aguarde</p>
      </div>
    </div>
  );
}
