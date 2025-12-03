
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, Video, HelpCircle, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ModuleForm from './ModuleForm';
import CourseOverviewTab from './CourseOverviewTab';
import ModuleSlides from './ModuleSlides';
import CourseExamTab from './CourseExamTab';
import CourseCertificatesTab from './CourseCertificatesTab';
import CourseMetricsTab from './CourseMetricsTab';

interface Course {
  id: string;
  titulo: string;
  descricao: string | null;
  ativo: boolean;
  slug: string;
}

interface Module {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
  _count?: {
    slides: number;
    questions: number;
  };
}

interface CourseDetailsProps {
  course: Course;
  onBack: () => void;
}

const CourseDetails = ({ course, onBack }: CourseDetailsProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalModules: 0,
    totalSlides: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalCertificates: 0,
  });

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const fetchModules = async () => {
    try {
      const { data: modulesData, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('ordem');

      if (error) throw error;

      // Buscar estatísticas gerais
      const [slidesCount, questionsCount, examsCount, certificatesCount] = await Promise.all([
        supabase.from('slides').select('id', { count: 'exact' }).eq('course_id', course.id),
        supabase.from('questions').select('id', { count: 'exact' }).eq('course_id', course.id),
        supabase.from('course_exams').select('id', { count: 'exact' }).eq('course_id', course.id),
        supabase.from('certificates').select('id', { count: 'exact' }).eq('course_id', course.id),
      ]);

      setStats({
        totalModules: modulesData?.length || 0,
        totalSlides: slidesCount.count || 0,
        totalQuestions: questionsCount.count || 0,
        totalExams: examsCount.count || 0,
        totalCertificates: certificatesCount.count || 0,
      });

      // Buscar estatísticas de cada módulo
      const modulesWithStats = await Promise.all(
        (modulesData || []).map(async (module) => {
          const [slidesResult, questionsResult] = await Promise.all([
            supabase
              .from('slides')
              .select('id', { count: 'exact' })
              .eq('module_id', module.id),
            supabase
              .from('slides')
              .select('id')
              .eq('module_id', module.id)
              .then(async (slideResult) => {
                if (slideResult.data) {
                  const slideIds = slideResult.data.map(s => s.id);
                  return supabase
                    .from('questions')
                    .select('id', { count: 'exact' })
                    .in('slide_id', slideIds);
                }
                return { count: 0 };
              })
          ]);

          return {
            ...module,
            _count: {
              slides: slidesResult.count || 0,
              questions: questionsResult.count || 0
            }
          };
        })
      );

      setModules(modulesWithStats);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      toast.error('Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleNewModule = () => {
    setEditingModule(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (moduleId: string) => {
    setEditingModule(moduleId);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todos os slides e perguntas associados serão removidos.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast.success('Módulo excluído com sucesso!');
      fetchModules();
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      toast.error('Erro ao excluir módulo');
    }
  };

  const handleModuleFormSave = () => {
    setShowModuleForm(false);
    setEditingModule(null);
    fetchModules();
  };

  const handleModuleFormCancel = () => {
    setShowModuleForm(false);
    setEditingModule(null);
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando módulos...</div>;
  }

  if (showModuleForm) {
    return (
      <ModuleForm
        courseId={course.id}
        moduleId={editingModule || undefined}
        onSave={handleModuleFormSave}
        onCancel={handleModuleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h3 className="text-lg font-semibold font-roboto">
            {course.titulo}
          </h3>
          <p className="text-sm text-muted-foreground font-opensans">{course.descricao}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="exam">Exame Final</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CourseOverviewTab course={course} stats={stats} />
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={handleNewModule}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Módulo
              </Button>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum módulo cadastrado.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clique em "Novo Módulo" para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <Card key={module.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModuleExpansion(module.id)}
                            className="p-1"
                          >
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleModuleExpansion(module.id)}
                        >
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-base font-opensans">
                                {module.titulo}
                              </CardTitle>
                              <Badge variant={module.ativo ? "default" : "secondary"}>
                                {module.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            {module.descricao && (
                              <p className="text-sm text-muted-foreground mt-1 font-opensans">
                                {module.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditModule(module.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>{module._count?.slides || 0} slides</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          <span>{module._count?.questions || 0} perguntas</span>
                        </div>
                      </div>

                      {expandedModules.has(module.id) && (
                        <div className="mt-4">
                          <ModuleSlides moduleId={module.id} courseId={course.id} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exam" className="mt-6">
          <CourseExamTab courseId={course.id} />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CourseCertificatesTab courseId={course.id} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <CourseMetricsTab courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetails;
