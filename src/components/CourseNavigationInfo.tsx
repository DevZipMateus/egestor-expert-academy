
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseNavigationInfo = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-roboto text-center" style={{ color: '#52555b' }}>
          Como Navegar pelo Curso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-roboto" style={{ color: '#52555b' }}>
                Para Alunos
              </h3>
              <p className="text-sm mb-4 font-opensans" style={{ color: '#52555b' }}>
                Acesse o dashboard do aluno para visualizar e navegar pelo curso completo.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full text-white font-opensans"
                style={{ backgroundColor: '#d61c00' }}
              >
                <Play className="w-4 h-4 mr-2" />
                Ir para Dashboard
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-2 border-red-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-roboto" style={{ color: '#52555b' }}>
                Para Administradores
              </h3>
              <p className="text-sm mb-4 font-opensans" style={{ color: '#52555b' }}>
                Gerencie slides, perguntas e usuários através do painel administrativo.
              </p>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full text-white font-opensans"
                style={{ backgroundColor: '#d61c00' }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Painel Admin
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4 font-roboto" style={{ color: '#52555b' }}>
            Estrutura do Curso:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold">47 Slides</p>
                <p className="text-gray-600">Conteúdo completo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-semibold">Exercícios</p>
                <p className="text-gray-600">Práticas interativas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-semibold">Exame Final</p>
                <p className="text-gray-600">80% para aprovação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-opensans text-gray-600">
            <strong>Nota:</strong> O curso utiliza dados estáticos para os slides principais e 
            dados dinâmicos do banco de dados para exercícios editáveis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseNavigationInfo;
