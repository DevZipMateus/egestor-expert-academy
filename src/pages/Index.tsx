import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen relative" style={{
    backgroundColor: '#f7f7f7'
  }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url('/lovable-uploads/bb10fadc-0c81-4e02-9c4e-225198fc9835.png')`
    }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative z-10">
        <header className="bg-opacity-95 shadow-sm bg-[#d61c00] text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 style={{
            color: '#52555b'
          }} className="text-2xl font-bold font-roboto text-primary-foreground">
              Expert eGestor Academy
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-lg font-roboto">
                Expert em eGestor
              </h2>
              <p className="text-lg text-white drop-shadow-md font-opensans">
                Fazendo esse pequeno curso você terá condições de administrar sua empresa com excelência usando o software eGestor.
              </p>
              <Button onClick={() => navigate('/introducao')} className="text-white px-8 py-3 text-lg shadow-lg font-opensans" style={{
              backgroundColor: '#d61c00'
            }}>
                Começar
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="w-full h-64 lg:h-96"></div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};
export default Index;