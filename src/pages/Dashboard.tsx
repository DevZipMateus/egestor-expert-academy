
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface ProgressoUsuario {
  ultima_aula: number;
  progresso_percentual: number;
  aulas_assistidas: number[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [progresso, setProgresso] = useState<ProgressoUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      await loadUserProgress(session.user.id);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('progresso_usuario')
        .select('ultima_aula, progresso_percentual, aulas_assistidas')
        .eq('usuario_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Progresso não existe, criar um novo
        const { data: newProgress, error: insertError } = await supabase
          .from('progresso_usuario')
          .insert([
            {
              usuario_id: userId,
              ultima_aula: 1,
              progresso_percentual: 0,
              aulas_assistidas: []
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar progresso:', insertError);
        } else {
          setProgresso(newProgress);
        }
      } else if (!error) {
        setProgresso(data);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao fazer logout');
    } else {
      navigate('/');
    }
  };

  const comecarDoInicio = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progresso_usuario')
        .update({
          ultima_aula: 1,
          progresso_percentual: 0,
          aulas_assistidas: [],
          data_atualizacao: new Date().toISOString()
        })
        .eq('usuario_id', user.id);

      if (error) {
        toast.error('Erro ao resetar progresso');
        return;
      }

      toast.success('Progresso resetado! Começando do início.');
      navigate('/curso/1');
    } catch (error) {
      console.error('Erro ao resetar progresso:', error);
      toast.error('Erro inesperado');
    }
  };

  const continuarDeOndeparou = () => {
    if (!progresso) {
      navigate('/curso/1');
      return;
    }

    const ultimaAula = progresso.ultima_aula || 1;
    navigate(`/curso/${ultimaAula}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">eGestor Expert Academy</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo de volta!
            </h2>
            <p className="text-lg text-gray-600">
              Continue sua jornada para se tornar um Expert em eGestor
            </p>
          </div>

          {progresso && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seu Progresso</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progresso do Curso</span>
                  <span>{progresso.progresso_percentual}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso.progresso_percentual}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Última aula: {progresso.ultima_aula}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Começar do Início
              </h3>
              <p className="text-green-700 mb-4">
                Reinicie seu progresso e comece o curso desde a primeira aula.
              </p>
              <Button 
                onClick={comecarDoInicio}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Começar do Início
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Continuar de Onde Parou
              </h3>
              <p className="text-blue-700 mb-4">
                Continue o curso de onde você parou na última vez.
              </p>
              <Button 
                onClick={continuarDeOndeparou}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar Curso
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
