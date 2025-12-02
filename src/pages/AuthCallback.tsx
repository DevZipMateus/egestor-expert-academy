import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing magic link callback...');
        
        // Wait for Supabase to process URL tokens (hash fragments)
        // The SDK needs time to extract and process tokens from the URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('[AuthCallback] Checking session after delay...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[AuthCallback] Session:', session ? 'Found' : 'Not found');
        console.log('[AuthCallback] Session error:', sessionError);
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError('link-invalid');
          setLoading(false);
          return;
        }

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
          } else {
            // Successfully authenticated, redirect to dashboard
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
