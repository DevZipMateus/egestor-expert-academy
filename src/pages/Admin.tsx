import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSlides from '@/components/admin/AdminSlides';
import AdminQuestions from '@/components/admin/AdminQuestions';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('slides');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8" style={{ color: '#d61c00' }} />
                <h1 className="text-2xl font-bold font-roboto" style={{ color: '#52555b' }}>
                  Painel Administrativo
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-opensans text-gray-700">{user?.nome}</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Admin</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-4 mb-8">
            <Button
              variant={activeTab === 'slides' ? 'default' : 'outline'}
              onClick={() => setActiveTab('slides')}
            >
              Slides
            </Button>
            <Button
              variant={activeTab === 'questions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('questions')}
            >
              Perguntas
            </Button>
          </div>

          {activeTab === 'slides' ? (
            <div>
              <AdminSlides />
            </div>
          ) : (
            <div>
              <AdminQuestions />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
