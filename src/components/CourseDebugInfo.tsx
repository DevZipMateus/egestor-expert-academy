
import React from 'react';
import { useCourseData } from '@/hooks/useCourseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, AlertCircle } from 'lucide-react';

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

  return (
    <Card className={`mb-4 ${error ? 'border-red-200 bg-red-50' : useStaticData ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${error ? 'text-red-800' : useStaticData ? 'text-yellow-800' : 'text-green-800'}`}>
          {useStaticData ? <FileText className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          Status dos Dados do Curso
          {error && <AlertCircle className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={useStaticData ? "secondary" : "default"}>
            {useStaticData ? 'Dados Locais' : 'Banco de Dados'}
          </Badge>
          <span className="text-sm">
            {getTotalSlidesCount()} slides disponíveis
          </span>
        </div>
        
        {!useStaticData && (
          <div className="text-sm space-y-1">
            <p>📊 Slides no banco: {slides.length}</p>
            <p>❓ Perguntas no banco: {questions.length}</p>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-700">
            <p className="font-medium">Erro encontrado:</p>
            <p>{error}</p>
          </div>
        )}
        
        {useStaticData && !error && (
          <p className="text-sm text-yellow-700">
            Usando dados estáticos de fallback - verifique a conectividade com o banco.
          </p>
        )}
        
        {!useStaticData && !error && (
          <p className="text-sm text-green-700">
            ✅ Dados carregados com sucesso do Supabase!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseDebugInfo;
