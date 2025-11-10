import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, HelpCircle, FileCheck, Award } from 'lucide-react';
import CourseShareCard from './CourseShareCard';

interface CourseOverviewTabProps {
  course: {
    id: string;
    titulo: string;
    descricao: string | null;
    ativo: boolean;
    slug: string;
  };
  stats: {
    totalModules: number;
    totalSlides: number;
    totalQuestions: number;
    totalExams: number;
    totalCertificates: number;
  };
}

const CourseOverviewTab = ({ course, stats }: CourseOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-roboto">Informações do Curso</CardTitle>
            <Badge variant={course.ativo ? "default" : "secondary"} className="text-sm">
              {course.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Título</h4>
            <p className="text-base font-opensans">{course.titulo}</p>
          </div>
          {course.descricao && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
              <p className="text-base font-opensans text-muted-foreground">{course.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Compartilhamento */}
      <CourseShareCard courseSlug={course.slug} />

      <div>
        <h3 className="text-lg font-semibold mb-4 font-roboto">Estatísticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Users className="w-8 h-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalModules}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Video className="w-8 h-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalSlides}</p>
                <p className="text-sm text-muted-foreground">Slides</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Perguntas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <FileCheck className="w-8 h-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalExams}</p>
                <p className="text-sm text-muted-foreground">Exames</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Award className="w-8 h-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseOverviewTab;
