
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, User, LogOut, Shield, Play, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';

interface CourseProgress {
  courseId: string;
  courseName: string;
  courseSlug: string;
  courseDescription: string;
  progress: number;
  lastSlide: number;
  totalSlides: number;
  isEnrolled: boolean;
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
      
      // Buscar todos os cursos ativos
      const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('id, titulo, slug, descricao')
        .eq('ativo', true);
      
      if (coursesError) {
        console.error('Erro ao carregar cursos:', coursesError);
        setLoading(false);
        return;
      }

      // Buscar progresso do usuário em cada curso
      const { data: enrollments } = await supabase
        .from('progresso_usuario')
        .select('course_id, aulas_assistidas, progresso_percentual')
        .eq('usuario_id', user.id);

      const enrollmentMap = new Map(
        enrollments?.map(e => [e.course_id, e]) || []
      );

      // Para cada curso, montar informações completas
      const coursesWithProgress = await Promise.all(
        (allCourses || []).map(async (course) => {
          const enrollment = enrollmentMap.get(course.id);
          
          // Buscar total de slides de conteúdo (excluindo intro e exame)
          const { count: totalSlides } = await supabase
            .from('slides')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('ativo', true)
            .gte('ordem', 1)
            .neq('tipo', 'exam');

          const lastSlide = enrollment?.aulas_assistidas?.length > 0
            ? Math.max(...enrollment.aulas_assistidas)
            : 0;

          return {
            courseId: course.id,
            courseName: course.titulo,
            courseSlug: course.slug,
            courseDescription: course.descricao || 'Aprimore suas habilidades com este curso completo.',
            progress: enrollment?.progresso_percentual || 0,
            lastSlide,
            totalSlides: totalSlides || 0,
            isEnrolled: !!enrollment,
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
    const nextSlide = lastSlide > 0 ? lastSlide + 1 : 1;
    navigate(`/curso/${courseId}/${nextSlide}`);
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle2 };
    if (progress >= 50) return { label: 'Em andamento', color: 'bg-amber-500', icon: Clock };
    if (progress > 0) return { label: 'Iniciado', color: 'bg-blue-500', icon: Play };
    return { label: 'Não iniciado', color: 'bg-gray-400', icon: BookOpen };
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-[hsl(4,86%,55%)]';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(4,86%,55%)] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-roboto text-[hsl(0,0%,35%)]">
                    eGestor Expert Academy
                  </h1>
                  <p className="text-xs text-gray-500 font-opensans">Plataforma de Treinamento</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-opensans text-sm text-gray-700">{user?.email}</span>
                </div>
                {role === 'admin' && (
                  <Button
                    onClick={() => navigate('/admin')}
                    size="sm"
                    className="flex items-center gap-2 bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-roboto text-[hsl(0,0%,35%)] mb-2">
              Olá, bem-vindo de volta!
            </h2>
            <p className="text-gray-600 font-opensans">
              Escolha um curso para continuar seu aprendizado.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <Loader2 className="w-12 h-12 text-[hsl(4,86%,55%)] animate-spin mb-4" />
              <p className="text-gray-500 font-opensans">Carregando cursos...</p>
            </div>
          ) : courses.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-roboto font-semibold mb-2 text-[hsl(0,0%,35%)]">
                  Nenhum curso disponível
                </h3>
                <p className="text-gray-500 font-opensans mb-6 max-w-md mx-auto">
                  No momento não há cursos cadastrados. Entre em contato com o administrador.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => {
                const status = getProgressStatus(course.progress);
                const StatusIcon = status.icon;
                
                return (
                  <Card 
                    key={course.courseId} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md"
                  >
                    {/* Card Header with Gradient */}
                    <div className="relative h-32 bg-gradient-to-br from-[hsl(4,86%,55%)] to-[hsl(4,86%,40%)] p-5">
                      <div className="absolute top-4 right-4">
                        <Badge 
                          className={`${status.color} text-white border-0 font-opensans text-xs`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-5 right-5">
                        <h3 className="text-white font-roboto font-bold text-lg line-clamp-2 drop-shadow-sm">
                          {course.courseName}
                        </h3>
                      </div>
                      {/* Decorative Element */}
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                    </div>

                    <CardContent className="p-5">
                      {/* Description */}
                      <p className="text-gray-600 font-opensans text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {course.courseDescription}
                      </p>

                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-opensans text-gray-500 uppercase tracking-wide">
                            Progresso
                          </span>
                          <span className="text-sm font-roboto font-bold text-[hsl(0,0%,35%)]">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(course.progress)} transition-all duration-500 rounded-full`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-4 border-b">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span className="font-opensans">
                            {course.lastSlide} de {course.totalSlides} aulas
                          </span>
                        </div>
                        {course.progress === 100 && (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Trophy className="w-4 h-4" />
                            <span className="font-opensans font-semibold">Completo</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={() => handleContinueCourse(course.courseId, course.lastSlide)}
                        className="w-full bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white font-opensans font-semibold group-hover:shadow-lg transition-all"
                      >
                        {course.progress === 100 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Revisar Curso
                          </>
                        ) : course.lastSlide > 0 ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continuar Curso
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar Curso
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
