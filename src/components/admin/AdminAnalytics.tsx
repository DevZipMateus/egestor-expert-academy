
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalSlides: 0,
    averageProgress: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Total de usuários
      const { count: usersCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      // Total de slides
      const { count: slidesCount } = await supabase
        .from('slides')
        .select('*', { count: 'exact', head: true });

      // Progresso médio
      const { data: progressData } = await supabase
        .from('progresso_usuario')
        .select('progresso_percentual');

      const averageProgress = progressData?.length
        ? progressData.reduce((acc, curr) => acc + (curr.progresso_percentual || 0), 0) / progressData.length
        : 0;

      // Usuários ativos (com progresso > 0)
      const activeUsers = progressData?.filter(p => (p.progresso_percentual || 0) > 0).length || 0;

      setAnalytics({
        totalUsers: usersCount || 0,
        totalSlides: slidesCount || 0,
        averageProgress: Math.round(averageProgress),
        activeUsers
      });

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Slides</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalSlides}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.averageProgress}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Taxa de Engajamento</span>
              <span className="text-sm text-gray-600">
                {analytics.totalUsers > 0 
                  ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100)
                  : 0
                }%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Slides por Usuário</span>
              <span className="text-sm text-gray-600">
                {analytics.totalUsers > 0 
                  ? Math.round(analytics.totalSlides / analytics.totalUsers)
                  : 0
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
