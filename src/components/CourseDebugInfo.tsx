
import React from 'react';
import { useCourseData } from '@/hooks/useCourseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const CourseDebugInfo: React.FC = () => {
  const { 
    slides, 
    questions, 
    loading, 
    error, 
    useStaticData, 
    getTotalSlidesCount 
  } = useCourseData();

  if (loading) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
            Carregando dados do curso...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (error) return 'border-red-200 bg-red-50';
    if (useStaticData) return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (useStaticData) return <FileText className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (error) return 'text-red-800';
    if (useStaticData) return 'text-yellow-800';
    return 'text-green-800';
  };

  const exerciseSlides = slides.filter(s => s.tipo === 'exercise');
  const contentSlides = slides.filter(s => s.tipo === 'content');
  const attentionSlides = slides.filter(s => s.tipo === 'attention');
  const examSlides = slides.filter(s => s.tipo === 'exam');

  return (
    <Card className={`mb-4 ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getStatusText()}`}>
          {getStatusIcon()}
          Status do Curso Expert eGestor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={useStaticData ? "secondary" : "default"}>
            {useStaticData ? 'Dados Locais' : 'Banco de Dados'}
          </Badge>
          <span className="text-sm font-medium">
            {getTotalSlidesCount()} slides total
          </span>
        </div>
        
        {!useStaticData && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Composição do Curso:</p>
              <p>📚 Aulas: {contentSlides.length}</p>
              <p>❓ Exercícios: {exerciseSlides.length}</p>
              <p>⚠️ Avisos: {attentionSlides.length}</p>
              <p>🏆 Exames: {examSlides.length}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Dados Carregados:</p>
              <p>📊 Slides: {slides.length}</p>
              <p>❓ Perguntas: {questions.length}</p>
              <p className="text-xs text-gray-600 mt-2">
                Exercícios com perguntas: {questions.filter(q => q.slide_id).length}
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
            <p className="font-medium">Erro encontrado:</p>
            <p>{error}</p>
            <p className="text-xs mt-1">Usando dados de fallback.</p>
          </div>
        )}
        
        {useStaticData && !error && (
          <div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
            <p>⚠️ Usando dados estáticos de fallback</p>
            <p className="text-xs mt-1">Verifique a conectividade com o banco de dados.</p>
          </div>
        )}
        
        {!useStaticData && !error && (
          <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
            <p>✅ Curso carregado com sucesso do banco de dados!</p>
            <p className="text-xs mt-1">
              Todos os {slides.length} slides e {questions.length} perguntas estão disponíveis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseDebugInfo;
