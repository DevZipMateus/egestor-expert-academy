import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const EXPERT_EGESTOR_COURSE_ID = '550e8400-e29b-41d4-a716-446655440000';

const Index = () => {
  const navigate = useNavigate();
  const [processingAuth, setProcessingAuth] = useState(false);

  useEffect(() => {
    // Check if there are auth tokens in the URL (magic link callback to root)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');

    if (access_token && refresh_token) {
      setProcessingAuth(true);
      console.log('[Index] Auth tokens detected, processing...');
      
      // Set the session and redirect
      supabase.auth.setSession({ access_token, refresh_token })
        .then(async ({ data, error }) => {
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          if (error) {
            console.error('[Index] Error setting session:', error);
            setProcessingAuth(false);
            return;
          }

          if (data.session?.user) {
            console.log('[Index] Session set successfully, redirecting...');
            
            // Check for pending course
            const pendingCourseId = localStorage.getItem('pendingCourseId');
            const pendingSlideNumber = localStorage.getItem('pendingSlideNumber') || '1';
            if (pendingCourseId) {
              localStorage.removeItem('pendingCourseId');
              localStorage.removeItem('pendingSlideNumber');
              navigate(`/curso/${pendingCourseId}/${pendingSlideNumber}`, { replace: true });
              return;
            }

            // Check user role for redirect
            const { data: userRole } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.session.user.id)
              .maybeSingle();

            const role = userRole?.role || 'user';
            if (role === 'user') {
              navigate(`/curso/${EXPERT_EGESTOR_COURSE_ID}/1`, { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else {
            setProcessingAuth(false);
          }
        })
        .catch((err) => {
          console.error('[Index] Auth processing error:', err);
          setProcessingAuth(false);
        });
    }
  }, [navigate]);

  if (processingAuth) {
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

  return <div className="min-h-screen relative" style={{
    backgroundColor: '#f7f7f7'
  }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url('/lovable-uploads/bb10fadc-0c81-4e02-9c4e-225198fc9835.png')`
    }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative z-10">
        <header className="bg-opacity-95 shadow-sm bg-[#d61c00] text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold font-roboto text-white">
              Expert eGestor Academy
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-lg font-roboto">
                Expert em eGestor
              </h2>
              <p className="text-lg text-white drop-shadow-md font-opensans">
                Fazendo esse pequeno curso você terá condições de administrar sua empresa com excelência usando o software eGestor.
              </p>
              <Button onClick={() => navigate('/introducao')} className="text-white px-8 py-3 text-lg shadow-lg font-opensans" style={{
              backgroundColor: '#d61c00'
            }}>
                Começar
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="w-full h-64 lg:h-96"></div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};
export default Index;