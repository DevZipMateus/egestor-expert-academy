
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { role, loading } = useUserRole(user?.email || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error("Você precisa fazer login para acessar esta página");
        navigate('/login');
        return;
      }

      if (requireAdmin && role !== 'admin') {
        toast.error("Acesso negado. Você não tem permissão de administrador.");
        navigate('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, role, loading, requireAdmin, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Verificando permissões...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
