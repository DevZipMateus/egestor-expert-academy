
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
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
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
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.senha,
        });

        if (error) {
          toast.error("Erro ao fazer login: " + error.message);
          return;
        }

        if (authData.user) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (userError && userError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('usuarios')
              .insert([
                {
                  id: authData.user.id,
                  nome: data.nome,
                  email: data.email,
                }
              ]);

            if (insertError) {
              console.error('Erro ao criar usuário:', insertError);
            }
          }

          toast.success("Login realizado com sucesso!");
          navigate('/dashboard');
        }
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.senha,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          toast.error("Erro ao criar conta: " + error.message);
          return;
        }

        if (authData.user) {
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert([
              {
                id: authData.user.id,
                nome: data.nome,
                email: data.email,
              }
            ]);

          if (insertError) {
            console.error('Erro ao inserir usuário:', insertError);
          }

          toast.success("Conta criada com sucesso! Verifique seu e-mail.");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
