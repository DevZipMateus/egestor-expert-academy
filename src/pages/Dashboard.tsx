
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Play, RotateCcw, LogOut } from "lucide-react";
import { toast } from "sonner";

interface ProgressoUsuario {
  ultima_aula: number;
  aulas_assistidas: number[];
  progresso_percentual: number;
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
      await buscarProgresso(session.user.id);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const buscarProgresso = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('progresso_usuario')
        .select('ultima_aula, aulas_assistidas, progresso_percentual')
        .eq('usuario_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', error);
        return;
      }

      if (data) {
        setProgresso(data);
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  };

  const iniciarDoComeco = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progresso_usuario')
        .update({
          ultima_aula: 1,
          aulas_assistidas: [],
          progresso_percentual: 0,
          data_atualizacao: new Date().toISOString()
        })
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Erro ao resetar progresso:', error);
        toast.error('Erro ao resetar progresso');
        return;
      }

      toast.success('Progresso resetado com sucesso!');
      navigate('/curso/1');
    } catch (error) {
      console.error('Erro ao resetar progresso:', error);
      toast.error('Erro ao resetar progresso');
    }
  };

  const continuarDeOndeParou = () => {
    const ultimaAula = progresso?.ultima_aula || 1;
    navigate(`/curso/${ultimaAula}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d61c00' }}></div>
          <p style={{ color: '#52555b' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f7' }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-roboto" style={{ color: '#52555b' }}>
              Expert eGestor Academy
            </h1>
            <p className="text-sm font-opensans mt-1" style={{ color: '#52555b' }}>
              Bem-vindo, {user?.email}
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2 border-red-600 hover:bg-red-50"
            style={{ color: '#d61c00', borderColor: '#d61c00' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-8 font-roboto" style={{ color: '#52555b' }}>
            Painel do Aluno
          </h2>

          {progresso && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 font-opensans" style={{ color: '#52555b' }}>
                Seu Progresso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold font-roboto" style={{ color: '#d61c00' }}>
                    {progresso.ultima_aula}
                  </p>
                  <p className="text-sm font-opensans" style={{ color: '#52555b' }}>
                    Última Aula
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-roboto" style={{ color: '#d61c00' }}>
                    {progresso.aulas_assistidas?.length || 0}
                  </p>
                  <p className="text-sm font-opensans" style={{ color: '#52555b' }}>
                    Aulas Assistidas
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-roboto" style={{ color: '#d61c00' }}>
                    {Math.round(progresso.progresso_percentual || 0)}%
                  </p>
                  <p className="text-sm font-opensans" style={{ color: '#52555b' }}>
                    Progresso
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progresso.progresso_percentual || 0}%`,
                      backgroundColor: '#d61c00'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <RotateCcw className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-roboto" style={{ color: '#52555b' }}>
                  Começar do Início
                </h3>
                <p className="text-sm mb-4 font-opensans" style={{ color: '#52555b' }}>
                  Reinicie seu progresso e comece o curso desde a primeira aula.
                </p>
                <Button 
                  onClick={iniciarDoComeco}
                  className="w-full text-white font-opensans"
                  style={{ backgroundColor: '#d61c00' }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Começar do Início
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-roboto" style={{ color: '#52555b' }}>
                  Continuar de Onde Parou
                </h3>
                <p className="text-sm mb-4 font-opensans" style={{ color: '#52555b' }}>
                  Continue seus estudos a partir da {progresso ? `aula ${progresso.ultima_aula}` : 'primeira aula'}.
                </p>
                <Button 
                  onClick={continuarDeOndeParou}
                  className="w-full text-white font-opensans"
                  style={{ backgroundColor: '#d61c00' }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Curso
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-opensans" style={{ color: '#52555b' }}>
              O curso possui <strong>47 slides</strong> com conteúdo, exercícios e um exame final.
              <br />
              Você precisa de <strong>80% de aprovação</strong> no exame para obter seu certificado.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
