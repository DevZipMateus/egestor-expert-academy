
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Por favor, insira um e-mail válido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log('Tentando fazer login/cadastro com:', { email: data.email, isLogin });
    
    try {
      if (isLogin) {
        // Processo de login
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.senha,
        });

        if (error) {
          console.error('Erro no login:', error);
          toast.error("Erro ao fazer login: " + error.message);
          return;
        }

        if (authData.user) {
          console.log('Login bem-sucedido, usuário:', authData.user);
          
          // Verificar se é admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', authData.user.id)
            .single();

          console.log('Role do usuário:', roleData, roleError);

          toast.success("Login realizado com sucesso!");
          
          // Redirecionar baseado no role
          if (roleData?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        // Processo de cadastro
        if (!data.nome) {
          toast.error("Nome é obrigatório para cadastro");
          return;
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.senha,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              nome: data.nome, // Passando o nome nos metadados para o trigger usar
            }
          },
        });

        if (error) {
          console.error('Erro no cadastro:', error);
          toast.error("Erro ao criar conta: " + error.message);
          return;
        }

        if (authData.user) {
          console.log('Cadastro bem-sucedido, usuário:', authData.user);
          toast.success("Conta criada com sucesso! Verifique seu e-mail.");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função melhorada para login admin
  const handleAdminLogin = async () => {
    setLoading(true);
    const adminEmail = 'mateus.pinto@zipline.com.br';
    const adminPassword = 'zipline';
    
    try {
      console.log('Iniciando processo de login admin...');
      
      // Tentar fazer login diretamente
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (loginData.user && !loginError) {
        console.log('Login admin bem-sucedido');
        toast.success("Login admin realizado com sucesso!");
        navigate('/admin');
        return;
      }

      // Se login falhou por email não confirmado, informar o usuário
      if (loginError?.message?.includes('Email not confirmed')) {
        console.log('Email não confirmado para admin');
        toast.error("Email do admin não está confirmado. Por favor, verifique seu email ou desabilite a confirmação por email nas configurações do Supabase.");
        return;
      }

      // Se login falhou por credenciais inválidas, tentar criar conta
      if (loginError?.message?.includes('Invalid login credentials')) {
        console.log('Credenciais inválidas, tentando criar conta admin...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: {
              nome: 'Administrador',
            }
          },
        });

        if (signUpError) {
          console.error('Erro ao criar conta admin:', signUpError);
          
          if (signUpError.message.includes('already registered')) {
            toast.error("Conta admin já existe mas há um problema com as credenciais. Verifique as configurações do Supabase.");
          } else if (signUpError.message.includes('rate_limit')) {
            toast.error("Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.");
          } else {
            toast.error("Erro ao processar login admin: " + signUpError.message);
          }
          return;
        }

        if (signUpData.user) {
          console.log('Conta admin criada com sucesso');
          toast.success("Conta admin criada! Verifique seu email para confirmar a conta.");
          return;
        }
      }

      // Para outros erros de login
      console.error('Erro no login admin:', loginError);
      toast.error("Erro ao fazer login admin: " + (loginError?.message || 'Erro desconhecido'));

    } catch (error) {
      console.error('Erro inesperado no login admin:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }

    // Preencher os campos do formulário
    setValue('email', adminEmail);
    setValue('senha', adminPassword);
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f7f7f7' }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-roboto" style={{ color: '#52555b' }}>
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="font-opensans" style={{ color: '#52555b' }}>
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta para começar o curso'}
          </p>
        </div>

        {/* Botão para login admin */}
        <div className="mb-4">
          <Button 
            type="button"
            onClick={handleAdminLogin}
            variant="outline"
            className="w-full text-sm"
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Login Admin (Teste)'}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isLogin && (
            <div>
              <Label htmlFor="nome" className="block text-sm font-medium mb-2 font-opensans" style={{ color: '#52555b' }}>
                Nome
              </Label>
              <Input
                id="nome"
                type="text"
                {...register("nome")}
                className={`w-full ${errors.nome ? 'border-red-500' : ''}`}
                placeholder="Digite seu nome completo"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-2 font-opensans" style={{ color: '#52555b' }}>
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="senha" className="block text-sm font-medium mb-2 font-opensans" style={{ color: '#52555b' }}>
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              {...register("senha")}
              className={`w-full ${errors.senha ? 'border-red-500' : ''}`}
              placeholder="Digite sua senha"
            />
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          <Button 
            type="submit"
            disabled={!isValid || loading}
            className="w-full text-white py-3 font-opensans disabled:bg-gray-400"
            style={{ backgroundColor: '#d61c00' }}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-opensans hover:underline"
            style={{ color: '#d61c00' }}
          >
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
