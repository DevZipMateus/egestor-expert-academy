
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, Youtube } from "lucide-react";

const Expert = () => {
  const openYouTube = () => {
    window.open('https://youtube.com/@egestor', '_blank');
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
        <div className="text-center mb-8">
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg mb-4">
            Parabéns! Curso Concluído
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Torne-se Expert em eGestor
          </h2>
          <p className="text-lg text-gray-600">
            Agora você pode obter sua certificação oficial
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Certificação Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Certificação Expert</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  Para obter sua certificação, você precisa:
                </p>
                <p className="text-green-700 mt-2">
                  ✓ Alcançar <strong>80% de acerto</strong> no teste final
                </p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Fazer Teste de Certificação
              </Button>
            </CardContent>
          </Card>

          {/* Lives Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Lives no YouTube</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  Participe das nossas lives semanais:
                </p>
                <p className="text-blue-700 mt-2">
                  📅 <strong>Todas as quartas-feiras</strong>
                </p>
                <p className="text-blue-700">
                  🕐 <strong>14h30</strong>
                </p>
              </div>
              <Button 
                onClick={openYouTube}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Acessar Canal no YouTube
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <p className="text-sm text-gray-700">Faça o teste de certificação</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <p className="text-sm text-gray-700">Participe das lives</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <p className="text-sm text-gray-700">Aplique o conhecimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Expert;
