
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, Video, HelpCircle, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ModuleForm from './ModuleForm';

interface Course {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
}

interface Module {
  id: string;
  nome: string;
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

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const fetchModules = async () => {
    try {
      const { data: modulesData, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', course.id)
        .order('ordem');

      if (error) throw error;

      // Buscar estatísticas de cada módulo
      const modulesWithStats = await Promise.all(
        (modulesData || []).map(async (module) => {
          const [slidesResult, questionsResult] = await Promise.all([
            supabase
              .from('slides')
              .select('id', { count: 'exact' })
              .eq('module_id', module.id),
            supabase
              .from('questions')
              .select('id', { count: 'exact' })
              .eq('module_id', module.id)
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
        .from('course_modules')
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
      <div className="flex items-center justify-between">
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
            <h3 className="text-lg font-semibold font-roboto" style={{ color: '#52555b' }}>
              {course.nome}
            </h3>
            <p className="text-sm text-gray-600 font-opensans">{course.descricao}</p>
          </div>
        </div>
        <Button 
          onClick={handleNewModule}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum módulo cadastrado ainda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Clique em "Novo Módulo" para começar a organizar o conteúdo do curso.
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base font-opensans">
                          {module.nome}
                        </CardTitle>
                        <Badge variant={module.ativo ? "default" : "secondary"}>
                          {module.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      {module.descricao && (
                        <p className="text-sm text-gray-600 mt-1 font-opensans">
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
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
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
                    <Video className="w-4 h-4" />
                    <span>{module._count?.slides || 0} slides</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{module._count?.questions || 0} perguntas</span>
                  </div>
                </div>

                {expandedModules.has(module.id) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      Conteúdo do módulo será exibido aqui (slides e perguntas)
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Gerenciar Slides
                      </Button>
                      <Button size="sm" variant="outline">
                        Gerenciar Perguntas
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
