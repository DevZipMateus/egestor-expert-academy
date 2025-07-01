
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular progresso do curso
    setProgress(Math.floor(Math.random() * 100));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleContinueCourse = () => {
    navigate('/curso/1');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8" style={{ color: '#d61c00' }} />
                <h1 className="text-2xl font-bold font-roboto" style={{ color: '#52555b' }}>
                  eGestor Expert Academy
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-opensans text-gray-700">{user?.nome}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Welcome Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-roboto" style={{ color: '#52555b' }}>
                    Bem-vindo de volta, {user?.nome}!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-opensans mb-6">
                    Continue sua jornada de aprendizado no eGestor Expert Academy
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-opensans text-gray-600">Progresso do Curso</span>
                        <span className="text-sm font-opensans font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button 
                      onClick={handleContinueCourse}
                      className="w-full text-white font-opensans"
                      style={{ backgroundColor: '#d61c00' }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continuar Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-roboto" style={{ color: '#52555b' }}>
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <span className="font-opensans text-sm">Aulas Assistidas</span>
                    </div>
                    <span className="font-semibold">{Math.floor(progress * 0.47)}/47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-opensans text-sm">Exercícios</span>
                    </div>
                    <span className="font-semibold">{Math.floor(progress * 0.1)}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-opensans text-sm">Tempo Total</span>
                    </div>
                    <span className="font-semibold">{Math.floor(progress * 0.8)}h</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
