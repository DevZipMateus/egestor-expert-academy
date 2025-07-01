
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, BookOpen, FileQuestion, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import AdminSlides from "@/components/admin/AdminSlides";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { role, loading: roleLoading, isAdmin } = useUserRole(user);

  useEffect(() => {
    checkAuth();
  }, []);

  // Só redireciona após ter verificado tanto auth quanto role, e apenas uma vez
  useEffect(() => {
    if (authChecked && !roleLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (!isAdmin && role === 'student') {
        toast.error("Acesso negado. Você não tem permissão de administrador.");
        navigate('/dashboard');
      }
    }
  }, [authChecked, roleLoading, user, isAdmin, role, navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      setUser(session.user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setAuthChecked(true);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Mostrar loading enquanto verifica auth e role
  if (loading || roleLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d61c00' }}></div>
          <p style={{ color: '#52555b' }}>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // Se não é admin, não renderiza nada (será redirecionado)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f7' }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      
      <header className="bg-white shadow-sm border-b-4" style={{ borderBottomColor: '#d61c00' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-roboto" style={{ color: '#52555b' }}>
              Painel Administrativo
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="slides" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="slides" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              Perguntas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slides">
            <Card>
              <CardHeader>
                <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
                  Gerenciamento de Slides
                </CardTitle>
                <CardDescription className="font-opensans">
                  Adicione, edite ou remova slides do curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSlides />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
                  Gerenciamento de Perguntas
                </CardTitle>
                <CardDescription className="font-opensans">
                  Crie e gerencie perguntas e exercícios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminQuestions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription className="font-opensans">
                  Visualize e gerencie usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUsers />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
                  Relatórios e Analytics
                </CardTitle>
                <CardDescription className="font-opensans">
                  Visualize estatísticas e progresso dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
