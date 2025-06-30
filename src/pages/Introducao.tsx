
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Introducao = () => {
  const navigate = useNavigate();

  const goToNext = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">eGestor Expert Academy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-700 text-center mb-8">
            Expert em eGestor
          </h1>

          {/* Content sections */}
          <div className="space-y-8 text-gray-600 max-w-3xl mx-auto">
            <p className="text-lg text-center">
              <strong>No final do curso você responderá um teste.</strong>
            </p>

            <div className="space-y-4">
              <p className="text-base">
                Se você <strong>responder corretamente mais de 80%</strong> das questões enviaremos para o seu e-mail um 
                certificado comprovando que você é um <strong>expert em eGestor</strong>.
              </p>
            </div>

            <p className="text-base">
              <strong>Assista ao conteúdo com calma.</strong>
            </p>

            <div className="space-y-4">
              <p className="text-base">
                Se ainda achar necessário, salientamos que todas às <strong>quartas-feiras às 14h30</strong> temos lives no canal 
                do youtube com implementações gratuitas, no link abaixo:
              </p>
              
              <div className="text-center">
                <Button 
                  onClick={() => window.open('https://www.youtube.com/eGestorERP', '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md"
                >
                  Canal eGestor Youtube
                </Button>
              </div>
            </div>

            <p className="text-base text-center">
              <strong>Vale a pena assistir!!</strong>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={goToNext}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <span>PRÓXIMO</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Introducao;
