import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, Award, Target } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseMetricsTabProps {
  courseId: string;
}

interface StudentProgress {
  nome: string;
  email: string;
  started_at: string;
  progresso_percentual: number;
  data_atualizacao: string;
}

interface Metrics {
  totalEnrolled: number;
  totalSystemUsers: number;
  conversionRate: number;
  averageProgress: number;
  completionRate: number;
}

const CourseMetricsTab = ({ courseId }: CourseMetricsTabProps) => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalEnrolled: 0,
    totalSystemUsers: 0,
    conversionRate: 0,
    averageProgress: 0,
    completionRate: 0
  });
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [courseId]);

  const fetchMetrics = async () => {
    try {
      // Total de usuários do sistema
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários inscritos neste curso
      const { data: enrolledUsers, error: enrolledError } = await supabase
        .from('progresso_usuario')
        .select(`
          usuario_id,
          started_at,
          progresso_percentual,
          data_atualizacao,
          profiles!inner (
            nome,
            email
          )
        `)
        .eq('course_id', courseId);

      if (enrolledError) {
        console.error('Erro ao buscar usuários inscritos:', enrolledError);
      }

      const enrolled = enrolledUsers || [];
      const totalEnrolled = enrolled.length;
      const totalSystemUsers = totalUsers || 0;
      
      // Calcular métricas
      const conversionRate = totalSystemUsers > 0 
        ? Math.round((totalEnrolled / totalSystemUsers) * 100)
        : 0;

      const averageProgress = enrolled.length > 0
        ? Math.round(enrolled.reduce((sum, user) => sum + (user.progresso_percentual || 0), 0) / enrolled.length)
        : 0;

      const completedCount = enrolled.filter(user => user.progresso_percentual >= 100).length;
      const completionRate = enrolled.length > 0
        ? Math.round((completedCount / enrolled.length) * 100)
        : 0;

      setMetrics({
        totalEnrolled,
        totalSystemUsers,
        conversionRate,
        averageProgress,
        completionRate
      });

      // Formatar dados dos alunos
      const formattedStudents: StudentProgress[] = enrolled.map((user: any) => ({
        nome: user.profiles.nome,
        email: user.profiles.email,
        started_at: user.started_at,
        progresso_percentual: user.progresso_percentual || 0,
        data_atualizacao: user.data_atualizacao
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSystemUsers}</div>
            <p className="text-xs text-muted-foreground">Total no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Inscritos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">Neste curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Inscritos / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Média dos alunos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Concluíram o curso</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum aluno inscrito neste curso ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Última Atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.nome}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{formatDate(student.started_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${student.progresso_percentual}%` }}
                          />
                        </div>
                        <span className="text-sm">{student.progresso_percentual}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(student.data_atualizacao)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseMetricsTab;
