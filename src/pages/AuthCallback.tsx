import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const EXPERT_EGESTOR_COURSE_ID = '550e8400-e29b-41d4-a716-446655440000';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing magic link callback...');
        console.log('[AuthCallback] Current URL:', window.location.href);
        console.log('[AuthCallback] Search:', window.location.search);
        console.log('[AuthCallback] Hash:', window.location.hash);
        
        // With HashRouter, the full hash is: #/auth/callback?code=...&... or #/auth/callback#access_token=...
        // We need to parse the part after /auth/callback
        const fullHash = window.location.hash; // e.g., #/auth/callback?code=xyz or #/auth/callback#access_token=xyz
        
        let searchPart = '';
        let tokenPart = '';
        
        // Check for query params after the route (e.g., #/auth/callback?code=...)
        const routeEnd = fullHash.indexOf('?');
        if (routeEnd !== -1) {
          searchPart = fullHash.substring(routeEnd);
        }
        
        // Check for hash fragment after the route (e.g., #/auth/callback#access_token=...)
        // This would be a double hash which browsers don't support well, so tokens usually come as query params
        // But also check window.location.search for PKCE flow
        if (window.location.search) {
          searchPart = window.location.search;
        }
        
        const searchParams = new URLSearchParams(searchPart);
        const code = searchParams.get('code');
        const urlError = searchParams.get('error');
        const urlErrorDescription = searchParams.get('error_description');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        if (urlError) {
          console.error('[AuthCallback] URL error:', urlError, urlErrorDescription);
          setError('link-invalid');
          setLoading(false);
          return;
        }
        
        console.log('[AuthCallback] Access token found:', !!access_token);
        console.log('[AuthCallback] Refresh token found:', !!refresh_token);
        console.log('[AuthCallback] PKCE code found:', !!code);
        
        let session = null;

        // PKCE flow: exchange the ?code= for a session
        if (code) {
          console.log('[AuthCallback] Exchanging PKCE code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[AuthCallback] Error exchanging code for session:', exchangeError);
            setError('link-invalid');
            setLoading(false);
            return;
          }

          session = data.session;
          console.log('[AuthCallback] Session created from PKCE code');

          // Clear query/hash from URL for cleaner look
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // If we have tokens in the URL, set the session manually
        if (!session && access_token && refresh_token) {
          console.log('[AuthCallback] Setting session from URL tokens...');
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (setSessionError) {
            console.error('[AuthCallback] Error setting session:', setSessionError);
            setError('link-invalid');
            setLoading(false);
            return;
          }
          
          session = data.session;
          console.log('[AuthCallback] Session set successfully');
          
          // Clear the hash from URL for cleaner look
          window.history.replaceState(null, '', window.location.pathname);
        } else if (!session) {
          // No tokens in URL, check for existing session
          console.log('[AuthCallback] No tokens in URL, checking existing session...');
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('[AuthCallback] Session error:', sessionError);
            setError('link-invalid');
            setLoading(false);
            return;
          }
          
          session = existingSession;
        }
        
        console.log('[AuthCallback] Session:', session ? 'Found' : 'Not found');
        
        if (session?.user) {
          console.log('[AuthCallback] User authenticated:', session.user.email);
          
          // Verificar se há curso pendente
          const pendingCourseId = localStorage.getItem('pendingCourseId');
          const pendingSlideNumber = localStorage.getItem('pendingSlideNumber') || '1';
          if (pendingCourseId) {
            console.log('[AuthCallback] Pending course found:', pendingCourseId, 'slide:', pendingSlideNumber);
            localStorage.removeItem('pendingCourseId');
            localStorage.removeItem('pendingSlideNumber');
            navigate(`/curso/${pendingCourseId}/${pendingSlideNumber}`, { replace: true });
            return;
          }
          
          // Buscar role do usuário para determinar redirecionamento
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          const role = userRole?.role || 'user';
          console.log('[AuthCallback] User role:', role);
          
          if (role === 'user') {
            // Usuário normal vai direto para o curso Expert eGestor
            navigate(`/curso/${EXPERT_EGESTOR_COURSE_ID}/1`, { replace: true });
          } else {
            // Admin ou funcionário vai para o dashboard
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.warn('[AuthCallback] No session found after processing');
          // No session found, link might be invalid or expired
          setError('link-invalid');
          setLoading(false);
        }
      } catch (err) {
        console.error('[AuthCallback] Callback error:', err);
        setError('general');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,95%)] px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[hsl(4,86%,55%)] mx-auto mb-4" />
          
          {error === 'link-invalid' ? (
            <>
              <h1 className="text-2xl font-bold text-[hsl(0,0%,25%)] mb-2">
                Link inválido ou expirado
              </h1>
              <p className="text-[hsl(0,0%,45%)] mb-6">
                Este link de acesso expirou ou já foi utilizado. Solicite um novo link de acesso e aguarde pelo menos 30 segundos antes de tentar reenviar.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[hsl(0,0%,25%)] mb-2">
                Erro ao confirmar acesso
              </h1>
              <p className="text-[hsl(0,0%,45%)] mb-6">
                Ocorreu um erro ao processar seu acesso. Por favor, tente novamente.
              </p>
            </>
          )}
          
          <Button
            onClick={() => navigate('/auth')}
            className="bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
