import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Menu, Settings } from 'lucide-react';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Auth() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: boolean; email?: boolean }>({});
  const { signInInstant, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const pendingCourseId = localStorage.getItem('pendingCourseId');
      if (pendingCourseId) {
        localStorage.removeItem('pendingCourseId');
        navigate(`/curso/${pendingCourseId}/1`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { nome?: boolean; email?: boolean } = {};
    
    if (!nome.trim()) {
      newErrors.nome = true;
      toast.error('Digite seu nome completo');
    }

    if (!email.trim()) {
      newErrors.email = true;
      if (!newErrors.nome) toast.error('Digite seu e-mail');
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = true;
      if (!newErrors.nome) toast.error('Digite um e-mail válido');
    }

    setErrors(newErrors);

    if (newErrors.nome || newErrors.email) {
      return;
    }

    setLoading(true);

    const { error, action_link } = await signInInstant(email.trim(), nome.trim());

    if (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      setLoading(false);
      return;
    }

    if (action_link) {
      window.location.href = action_link;
    }
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
            <h1 className="text-5xl lg:text-6xl font-bold text-[hsl(0,0%,25%)] mb-12 leading-tight">
              Escreva suas<br />informações
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="nome" className={`text-base ${errors.nome ? 'text-red-500' : 'text-[hsl(0,0%,25%)]'}`}>
                  Nome completo *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (errors.nome) setErrors(prev => ({ ...prev, nome: false }));
                  }}
                  required
                  className={`h-12 bg-white rounded-lg transition-colors ${
                    errors.nome 
                      ? 'border-red-500 border-2 focus-visible:ring-red-500' 
                      : 'border-[hsl(0,0%,70%)]'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm">Campo obrigatório</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={`text-base ${errors.email ? 'text-red-500' : 'text-[hsl(0,0%,25%)]'}`}>
                  Endereço de e-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: false }));
                  }}
                  required
                  className={`h-12 bg-white rounded-lg transition-colors ${
                    errors.email 
                      ? 'border-red-500 border-2 focus-visible:ring-red-500' 
                      : 'border-[hsl(0,0%,70%)]'
                  }`}
                  placeholder="Digite seu e-mail"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">E-mail inválido ou não preenchido</p>
                )}
              </div>

              <div className="pt-8">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white px-8 py-6 text-base font-medium disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Começar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Red background */}
      <div className="hidden lg:block lg:w-1/2 bg-[hsl(4,86%,55%)]" />
    </div>
  );
}
