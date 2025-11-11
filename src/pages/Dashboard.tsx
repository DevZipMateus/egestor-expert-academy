
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Clock, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';

interface CourseProgress {
  courseId: string;
  courseName: string;
  courseSlug: string;
  progress: number;
  lastSlide: number;
  totalSlides: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user?.email || null);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      // Buscar todos os cursos em que o usuário está matriculado
      const { data: enrollments, error: enrollError } = await supabase
        .from('progresso_usuario')
        .select(`
          course_id,
          aulas_assistidas,
          progresso_percentual,
          courses (
            id,
            titulo,
            slug
          )
        `)
        .eq('usuario_id', user.id);
      
      if (enrollError) {
        console.error('Erro ao carregar cursos:', enrollError);
        setLoading(false);
        return;
      }

      if (!enrollments || enrollments.length === 0) {
        setLoading(false);
        return;
      }

      // Para cada curso, buscar total de slides
      const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = enrollment.courses as any;
          
          // Buscar total de slides do curso
          const { count: totalSlides } = await supabase
            .from('slides')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', enrollment.course_id)
            .eq('ativo', true);

          // Calcular último slide assistido
          const lastSlide = enrollment.aulas_assistidas && enrollment.aulas_assistidas.length > 0
            ? Math.max(...enrollment.aulas_assistidas)
            : 0;

          return {
            courseId: enrollment.course_id,
            courseName: course?.titulo || 'Curso sem título',
            courseSlug: course?.slug || '',
            progress: enrollment.progresso_percentual || 0,
            lastSlide,
            totalSlides: totalSlides || 0,
          };
        })
      );

      setCourses(coursesWithProgress);
      setLoading(false);
    };
    
    loadCourses();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleContinueCourse = async (courseId: string, lastSlide: number) => {
    // Se tem progresso, pegar o último slide assistido + 1, senão começar do slide 1
    const nextSlide = lastSlide > 0 ? lastSlide + 1 : 1;
    
    // Navegar para o curso com courseId e slide corretos
    navigate(`/curso/${courseId}/${nextSlide}`);
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
                  <span className="font-opensans text-gray-700">{user?.email}</span>
                </div>
                {role === 'admin' && (
                  <Button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: '#d61c00' }}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d61c00' }}></div>
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-roboto font-semibold mb-2" style={{ color: '#52555b' }}>
                  Nenhum curso iniciado
                </h3>
                <p className="text-gray-600 font-opensans mb-6">
                  Você ainda não está matriculado em nenhum curso.
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  className="text-white font-opensans"
                  style={{ backgroundColor: '#d61c00' }}
                >
                  Explorar Cursos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              <h2 className="text-2xl font-bold font-roboto mb-6" style={{ color: '#52555b' }}>
                Meus Cursos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="font-roboto text-lg" style={{ color: '#52555b' }}>
                        {course.courseName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-opensans text-gray-600">Progresso</span>
                            <span className="text-sm font-opensans font-semibold">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              <span className="font-opensans text-gray-600">Aulas Assistidas</span>
                            </div>
                            <span className="font-semibold">{course.lastSlide}/{course.totalSlides}</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleContinueCourse(course.courseId, course.lastSlide)}
                          className="w-full text-white font-opensans mt-4"
                          style={{ backgroundColor: '#d61c00' }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          {course.lastSlide > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
