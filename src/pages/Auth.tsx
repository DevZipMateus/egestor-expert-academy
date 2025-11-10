import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Menu, Settings } from 'lucide-react';

const RESEND_COOLDOWN = 30; // seconds

export default function Auth() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const { signInWithMagicLink, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check for existing cooldown
    const nextSendAt = localStorage.getItem('next_send_at');
    if (nextSendAt) {
      const remaining = Math.max(0, Math.floor((parseInt(nextSendAt) - Date.now()) / 1000));
      if (remaining > 0) {
        setCooldownRemaining(remaining);
      } else {
        localStorage.removeItem('next_send_at');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            localStorage.removeItem('next_send_at');
            return 0;
          }
          return newValue;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nome || !email) {
      toast.error('Preencha todos os campos');
      setLoading(false);
      return;
    }

    // Check if email is admin
    const ADMIN_EMAILS = [
      'mateus.pinto@zipline.com.br',
      'joseph@zipline.com.br'
    ];
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    if (isAdmin) {
      // Admin instant login
      try {
        console.log('[Auth] Admin email detected, calling instant login function');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/admin-instant-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            name: nome,
            redirectTo: `${window.location.origin}/auth/callback`,
            supabaseUrl: supabaseUrl
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Auth] Error from admin-instant-login:', errorData);
          toast.error('Erro ao fazer login. Tente novamente.');
          setLoading(false);
          return;
        }

        const { action_link } = await response.json();
        console.log('[Auth] Magic link received, redirecting...');
        
        // Redirect to magic link immediately
        window.location.href = action_link;
        // Don't set loading to false as we're redirecting
        return;
      } catch (error) {
        console.error('[Auth] Error calling admin instant login:', error);
        toast.error('Erro ao fazer login. Tente novamente.');
        setLoading(false);
        return;
      }
    }

    // Regular user flow - Magic Link via email
    const { error } = await signInWithMagicLink(email, nome);
    
    if (error) {
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('only request this') || errorMessage.includes('rate_limit')) {
        toast.error('Aguarde 30 segundos para reenviar o link');
        const nextSendTime = Date.now() + RESEND_COOLDOWN * 1000;
        localStorage.setItem('next_send_at', nextSendTime.toString());
        setCooldownRemaining(RESEND_COOLDOWN);
      } else {
        toast.error('Erro ao enviar link. Tente novamente em alguns instantes.');
      }
    } else {
      setEmailSent(true);
      const nextSendTime = Date.now() + RESEND_COOLDOWN * 1000;
      localStorage.setItem('next_send_at', nextSendTime.toString());
      setCooldownRemaining(RESEND_COOLDOWN);
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
                      disabled={loading || cooldownRemaining > 0}
                      className="bg-[hsl(4,86%,55%)] hover:bg-[hsl(4,86%,45%)] text-white px-8 py-6 text-base font-medium disabled:opacity-50"
                    >
                      {loading ? 'Aguarde...' : cooldownRemaining > 0 ? `Aguarde ${cooldownRemaining}s` : 'Começar'}
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
                  onClick={() => {
                    setEmailSent(false);
                    setCooldownRemaining(0);
                    localStorage.removeItem('next_send_at');
                  }}
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
