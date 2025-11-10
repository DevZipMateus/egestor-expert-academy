import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Menu, Settings } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/introducao');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nome || !email) {
      toast.error('Preencha todos os campos');
      setLoading(false);
      return;
    }

    const { error } = await signInWithMagicLink(email, nome);
    
    if (error) {
      toast.error('Erro ao enviar link: ' + error.message);
    } else {
      setEmailSent(true);
      toast.success(`Link de acesso enviado para ${email}!`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 bg-[hsl(0,0%,95%)] flex flex-col">
        {/* Icons */}
        <div className="flex gap-2 p-4">
          <button className="w-12 h-12 bg-[hsl(4,86%,55%)] flex items-center justify-center">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 bg-[hsl(4,86%,55%)] flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {!emailSent ? (
              <>
                <h1 className="text-5xl lg:text-6xl font-bold text-[hsl(0,0%,25%)] mb-12 leading-tight">
                  Escreva suas<br />informações
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-[hsl(0,0%,25%)] text-base">
                      Nome*
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="h-12 bg-white border-[hsl(0,0%,70%)] rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[hsl(0,0%,25%)] text-base">
                      Endereço de e-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white border-[hsl(0,0%,70%)] rounded-lg"
                    />
                  </div>

                  <div className="pt-8">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white px-8 py-6 text-base font-medium"
                    >
                      {loading ? 'Aguarde...' : 'Começar'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <h1 className="text-4xl lg:text-5xl font-bold text-[hsl(0,0%,25%)] mb-6 leading-tight">
                  Verifique seu<br />e-mail!
                </h1>
                <p className="text-[hsl(0,0%,45%)] text-lg mb-8">
                  Enviamos um link de acesso para<br />
                  <span className="font-semibold text-[hsl(0,0%,25%)]">{email}</span>
                </p>
                <p className="text-[hsl(0,0%,45%)] text-sm mb-8">
                  Clique no link para acessar a plataforma
                </p>
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="border-[hsl(0,0%,70%)] text-[hsl(0,0%,45%)] hover:bg-[hsl(0,0%,95%)]"
                >
                  Voltar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Red background */}
      <div className="hidden lg:block lg:w-1/2 bg-[hsl(4,86%,55%)]" />
    </div>
  );
}
