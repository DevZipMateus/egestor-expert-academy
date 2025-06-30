
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/bb10fadc-0c81-4e02-9c4e-225198fc9835.png')`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white bg-opacity-95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">eGestor Expert Academy</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                Expert em eGestor
              </h2>
              <p className="text-lg text-white drop-shadow-md">
                Fazendo esse pequeno curso você terá condições de administrar sua empresa com excelência usando o software eGestor.
              </p>
              <Button 
                onClick={() => navigate('/cadastro')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg shadow-lg"
              >
                Começar
              </Button>
            </div>

            {/* Empty space for image area */}
            <div className="flex justify-center">
              <div className="w-full h-64 lg:h-96"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
