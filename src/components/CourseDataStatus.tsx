
import React from 'react';
import { Database, FileText, Wifi, WifiOff } from 'lucide-react';

interface CourseDataStatusProps {
  useStaticData: boolean;
  loading: boolean;
  error?: string | null;
}

const CourseDataStatus: React.FC<CourseDataStatusProps> = ({ 
  useStaticData, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        <span>Carregando dados do curso...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <WifiOff className="w-4 h-4" />
        <span>Erro na conexão - usando dados locais</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${
      useStaticData ? 'text-yellow-600' : 'text-green-600'
    }`}>
      {useStaticData ? (
        <>
          <FileText className="w-4 h-4" />
          <span>Dados locais</span>
        </>
      ) : (
        <>
          <Database className="w-4 h-4" />
          <span>Dados do servidor</span>
        </>
      )}
    </div>
  );
};

export default CourseDataStatus;
