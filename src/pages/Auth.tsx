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
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const { signUp, signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/introducao');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!nome || !email || !password) {
        toast.error('Preencha todos os campos');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, nome);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Faça login.');
        } else {
          toast.error('Erro ao criar conta: ' + error.message);
        }
      } else {
        toast.success('Conta criada com sucesso! Você já pode fazer login.');
        setIsSignUp(false);
      }
    } else {
      if (!email || !password) {
        toast.error('Preencha todos os campos');
        setLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/introducao');
      }
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
            <h1 className="text-5xl lg:text-6xl font-bold text-[hsl(0,0%,25%)] mb-12 leading-tight">
              Escreva suas<br />informações
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-[hsl(0,0%,25%)] text-base">
                    Nome*
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required={isSignUp}
                    className="h-12 bg-white border-[hsl(0,0%,70%)] rounded-lg"
                  />
                </div>
              )}

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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(0,0%,25%)] text-base">
                  Senha *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-white border-[hsl(0,0%,70%)] rounded-lg"
                />
                {isSignUp && (
                  <p className="text-xs text-[hsl(0,0%,45%)]">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-8">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white px-8 py-6 text-base font-medium"
                >
                  {loading ? 'Aguarde...' : 'Começar'}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[hsl(0,0%,45%)] text-sm underline"
                >
                  {isSignUp ? 'Já tem uma conta? Entrar' : 'Criar nova conta'}
                </button>
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
