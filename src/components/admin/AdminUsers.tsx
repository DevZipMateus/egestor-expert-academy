import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldOff, Loader2, Search, ChevronDown, Building2, GraduationCap } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    newRole: 'admin' | 'funcionario' | 'user';
  } | null>(null);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    funcionarios: 0,
    students: 0
  });

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.nome.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

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
      const funcionarios = usersWithData.filter(u => u.role === 'funcionario').length;
      const students = usersWithData.filter(u => u.role === 'user').length;

      setStats({ totalUsers, admins, funcionarios, students });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'funcionario' | 'user') => {
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
      const funcionarios = updatedUsers.filter(u => u.role === 'funcionario').length;
      const students = updatedUsers.filter(u => u.role === 'user').length;
      setStats({ totalUsers: updatedUsers.length, admins, funcionarios, students });

      const roleLabel = newRole === 'admin' ? 'Administrador' : newRole === 'funcionario' ? 'Funcionário' : 'Estudante';
      toast({
        title: 'Role atualizado',
        description: `Usuário agora é ${roleLabel}.`,
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

  const openConfirmDialog = (user: UserData, newRole: 'admin' | 'funcionario' | 'user') => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.funcionarios}</div>
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

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
        {searchTerm && (
          <span className="text-sm text-muted-foreground ml-3">
            {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        )}
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className={user.role === 'funcionario' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                  >
                    {user.role === 'admin' ? 'Admin' : user.role === 'funcionario' ? 'Funcionário' : 'Estudante'}
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
                  {updatingUserId === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Alterar Role
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => openConfirmDialog(user, 'admin')}>
                            <Shield className="w-4 h-4 mr-2 text-purple-600" />
                            Tornar Admin
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'funcionario' && (
                          <DropdownMenuItem onClick={() => openConfirmDialog(user, 'funcionario')}>
                            <Building2 className="w-4 h-4 mr-2 text-amber-600" />
                            Tornar Funcionário
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'user' && (
                          <DropdownMenuItem onClick={() => openConfirmDialog(user, 'user')}>
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                            Tornar Estudante
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                : confirmDialog?.newRole === 'funcionario'
                ? 'Definir como Funcionário?'
                : 'Alterar para Estudante?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.newRole === 'admin' 
                ? `${confirmDialog?.userName} terá acesso total ao painel administrativo, incluindo gerenciamento de cursos, usuários e certificados.`
                : confirmDialog?.newRole === 'funcionario'
                ? `${confirmDialog?.userName} será marcado como funcionário da Zipline.`
                : `${confirmDialog?.userName} será definido como estudante comum.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog && handleRoleChange(confirmDialog.userId, confirmDialog.newRole)}
              className={confirmDialog?.newRole === 'admin' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : confirmDialog?.newRole === 'funcionario'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
