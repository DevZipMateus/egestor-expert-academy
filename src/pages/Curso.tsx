
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const cursoData = {
  1: {
    titulo: "Cadastro de Clientes e Fornecedores",
    conteudo: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Cadastro de Clientes e Fornecedores
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <p className="text-lg text-gray-700 mb-4">
            Aprenda como cadastrar corretamente clientes e fornecedores no eGestor:
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Dados obrigatórios e opcionais</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Erros comuns a evitar</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Organização por categorias</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  2: {
    titulo: "Gestão Financeira",
    conteudo: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestão Financeira Eficiente
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <p className="text-lg text-gray-700 mb-4">
            Controle financeiro completo com o eGestor:
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Contas a pagar e receber</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Relatórios financeiros</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Fluxo de caixa</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

const Curso = () => {
  const { slide } = useParams();
  const navigate = useNavigate();
  const currentSlide = parseInt(slide || '1');
  const totalSlides = Object.keys(cursoData).length;
  
  const currentContent = cursoData[currentSlide as keyof typeof cursoData];

  const goToPrevious = () => {
    if (currentSlide > 1) {
      navigate(`/curso/${currentSlide - 1}`);
    }
  };

  const goToNext = () => {
    if (currentSlide < totalSlides) {
      navigate(`/curso/${currentSlide + 1}`);
    } else {
      navigate('/expert');
    }
  };

  if (!currentContent) {
    navigate('/curso/1');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">eGestor Expert Academy</h1>
          <p className="text-sm text-gray-600 mt-1">
            Slide {currentSlide} de {totalSlides}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-100 rounded-lg p-8">
          {currentContent.conteudo}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={goToPrevious}
            disabled={currentSlide === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ANTERIOR</span>
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index + 1 === currentSlide ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={goToNext}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <span>{currentSlide === totalSlides ? 'FINALIZAR' : 'PRÓXIMO'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Curso;
