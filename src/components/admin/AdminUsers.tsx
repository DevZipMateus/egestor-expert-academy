import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    newRole: 'admin' | 'user';
  } | null>(null);
  const { toast } = useToast();
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
      // Buscar profiles (substituiu usuarios)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Buscar progresso dos usuários
      const { data: progressoData, error: progressoError } = await supabase
        .from('progresso_usuario')
        .select('usuario_id, aulas_assistidas, progresso_percentual');

      if (progressoError) throw progressoError;

      // Combinar dados
      const usersWithData = profilesData?.map(user => {
        const userRole = rolesData?.find(role => role.user_id === user.id);
        const userProgress = progressoData?.find(prog => prog.usuario_id === user.id);
        
        return {
          ...user,
          role: userRole?.role || 'user',
          progresso: userProgress ? {
            ultima_aula: userProgress.aulas_assistidas?.[userProgress.aulas_assistidas.length - 1] || 0,
            progresso_percentual: userProgress.progresso_percentual
          } : undefined
        };
      }) || [];

      setUsers(usersWithData);

      // Calcular estatísticas
      const totalUsers = usersWithData.length;
      const admins = usersWithData.filter(u => u.role === 'admin').length;
      const students = usersWithData.filter(u => u.role === 'user').length;

      setStats({ totalUsers, admins, students });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    setUpdatingUserId(userId);
    try {
      // Verificar se já existe um registro de role para este usuário
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRole) {
        // Atualizar role existente
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Inserir novo role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) throw insertError;
      }

      // Atualizar lista local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      // Recalcular estatísticas
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      const admins = updatedUsers.filter(u => u.role === 'admin').length;
      const students = updatedUsers.filter(u => u.role === 'user').length;
      setStats({ totalUsers: updatedUsers.length, admins, students });

      toast({
        title: 'Role atualizado',
        description: `Usuário agora é ${newRole === 'admin' ? 'Administrador' : 'Estudante'}.`,
      });

    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: 'Erro ao atualizar role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
      setConfirmDialog(null);
    }
  };

  const openConfirmDialog = (user: UserData, newRole: 'admin' | 'user') => {
    setConfirmDialog({
      open: true,
      userId: user.id,
      userName: user.nome,
      newRole
    });
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
              <TableHead className="text-right">Ações</TableHead>
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
                <TableCell className="text-right">
                  {user.role === 'admin' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfirmDialog(user, 'user')}
                      disabled={updatingUserId === user.id}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      {updatingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Remover Admin
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfirmDialog(user, 'admin')}
                      disabled={updatingUserId === user.id}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      {updatingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-1" />
                          Tornar Admin
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog open={confirmDialog?.open} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.newRole === 'admin' 
                ? 'Promover a Administrador?' 
                : 'Remover acesso de Administrador?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.newRole === 'admin' 
                ? `${confirmDialog?.userName} terá acesso total ao painel administrativo, incluindo gerenciamento de cursos, usuários e certificados.`
                : `${confirmDialog?.userName} perderá acesso ao painel administrativo e voltará a ser um estudante comum.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog && handleRoleChange(confirmDialog.userId, confirmDialog.newRole)}
              className={confirmDialog?.newRole === 'admin' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-orange-600 hover:bg-orange-700'}
            >
              {confirmDialog?.newRole === 'admin' ? 'Promover' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
