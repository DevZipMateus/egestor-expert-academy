
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">eGestor Expert Academy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Administre sua empresa com excelência usando o eGestor
            </h2>
            <p className="text-lg text-gray-600">
              Aprenda as melhores práticas para gerenciar seu negócio de forma eficiente e profissional.
            </p>
            <Button 
              onClick={() => navigate('/cadastro')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Começar
            </Button>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Ambiente de escritório profissional"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
