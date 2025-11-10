import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Clock, Award } from "lucide-react";
import { toast } from "sonner";

interface CourseInfo {
  id: string;
  titulo: string;
  descricao: string | null;
  ativo: boolean;
}

const CourseAccess = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseSlug]);

  useEffect(() => {
    // Se usuário já está autenticado, redirecionar para o curso
    if (isAuthenticated && course) {
      navigate(`/curso/${course.id}/1`);
    }
  }, [isAuthenticated, course, navigate]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, titulo, descricao, ativo')
        .eq('slug', courseSlug)
        .eq('ativo', true)
        .single();

      if (error || !data) {
        toast.error('Curso não encontrado ou inativo');
        navigate('/');
        return;
      }

      setCourse(data);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      toast.error('Erro ao carregar curso');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = () => {
    if (course) {
      // Salvar curso no localStorage para redirecionar após login
      localStorage.setItem('pendingCourseId', course.id);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white pb-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-10 h-10" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold">
                {course.titulo}
              </CardTitle>
              {course.descricao && (
                <p className="text-red-50 text-lg max-w-2xl mx-auto">
                  {course.descricao}
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-8 pb-12">
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Aprenda no seu ritmo</h3>
                  <p className="text-sm text-gray-600">Acesso completo ao conteúdo</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Conteúdo prático</h3>
                  <p className="text-sm text-gray-600">Exercícios e exemplos reais</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                  <Award className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Certificado</h3>
                  <p className="text-sm text-gray-600">Ao concluir o curso</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <Button
                  onClick={handleStartCourse}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
                >
                  Começar Agora
                </Button>
                <p className="text-sm text-gray-500">
                  Você será direcionado para fazer login ou criar sua conta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseAccess;
