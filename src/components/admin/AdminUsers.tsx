
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserData {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  role?: string;
  progresso?: {
    ultima_aula: number;
    progresso_percentual: number;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    students: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Buscar usuários da tabela usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (usuariosError) throw usuariosError;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Buscar progresso dos usuários
      const { data: progressoData, error: progressoError } = await supabase
        .from('progresso_usuario')
        .select('usuario_id, ultima_aula, progresso_percentual');

      if (progressoError) throw progressoError;

      // Combinar dados
      const usersWithData = usuariosData?.map(user => {
        const userRole = rolesData?.find(role => role.user_id === user.id);
        const userProgress = progressoData?.find(prog => prog.usuario_id === user.id);
        
        return {
          ...user,
          role: userRole?.role || 'student',
          progresso: userProgress ? {
            ultima_aula: userProgress.ultima_aula,
            progresso_percentual: userProgress.progresso_percentual
          } : undefined
        };
      }) || [];

      setUsers(usersWithData);

      // Calcular estatísticas
      const totalUsers = usersWithData.length;
      const admins = usersWithData.filter(u => u.role === 'admin').length;
      const students = usersWithData.filter(u => u.role === 'student').length;

      setStats({ totalUsers, admins, students });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Última Aula</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Data de Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Estudante'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.progresso?.ultima_aula || 'N/A'}
                </TableCell>
                <TableCell>
                  {user.progresso?.progresso_percentual 
                    ? `${Math.round(user.progresso.progresso_percentual)}%`
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
