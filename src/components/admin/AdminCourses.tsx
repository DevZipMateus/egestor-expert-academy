
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Edit, Trash2, ChevronRight, Users, FileText, Video, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import CourseForm from './CourseForm';
import CourseDetails from './CourseDetails';

interface Course {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  _count?: {
    modules: number;
    slides: number;
    questions: number;
  };
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .order('ordem');

      if (error) throw error;

      // Buscar estatísticas de cada curso
      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const [modulesResult, slidesResult, questionsResult] = await Promise.all([
            supabase
              .from('course_modules')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id),
            supabase
              .from('slides')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id),
            supabase
              .from('questions')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id)
          ]);

          return {
            ...course,
            _count: {
              modules: modulesResult.count || 0,
              slides: slidesResult.count || 0,
              questions: questionsResult.count || 0
            }
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (courseId: string) => {
    setEditingCourse(courseId);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso? Todos os módulos, slides e perguntas associados serão removidos.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast.success('Curso excluído com sucesso!');
      fetchCourses();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      toast.error('Erro ao excluir curso');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    fetchCourses();
  };

  if (loading) {
    return <div className="text-center py-8">Carregando cursos...</div>;
  }

  if (showForm) {
    return (
      <CourseForm
        courseId={editingCourse || undefined}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cursos Disponíveis</h3>
        <Button 
          onClick={handleNewCourse}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum curso cadastrado ainda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Clique em "Novo Curso" para começar a criar cursos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-opensans">
                        {course.nome}
                      </CardTitle>
                      <Badge variant={course.ativo ? "default" : "secondary"}>
                        {course.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {course.descricao && (
                      <p className="text-sm text-gray-600 mt-2 font-opensans">
                        {course.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectCourse(course)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCourse(course.id)}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course._count?.modules || 0} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>{course._count?.slides || 0} slides</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{course._count?.questions || 0} perguntas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
