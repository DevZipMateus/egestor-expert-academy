
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Por favor, insira um e-mail válido"),
  adminCode: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      adminCode: "",
    }
  });

  const emailValue = watch("email");
  const { role } = useUserRole(emailValue);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log('Dados do login:', data);
    
    try {
      // Verificar se é tentativa de acesso admin
      if (showAdminCode) {
        const correctAdminCode = "ZIPLINE2024ADMIN";
        if (data.adminCode !== correctAdminCode) {
          toast.error("Código de administrador incorreto!");
          setLoading(false);
          return;
        }
        
        if (data.email !== 'mateus.pinto@zipline.com.br') {
          toast.error("Email não autorizado para acesso administrativo!");
          setLoading(false);
          return;
        }
      }

      // Fazer login
      login(data.nome, data.email);
      toast.success("Login realizado com sucesso!");
      
      // Redirecionar baseado no role
      if (role === 'admin' && showAdminCode) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
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
            {showAdminCode ? 'Acesso Administrativo' : 'Acesso ao Curso'}
          </h1>
          <p className="font-opensans" style={{ color: '#52555b' }}>
            {showAdminCode ? 'Insira suas credenciais e código admin' : 'Insira seus dados para acessar o curso'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {showAdminCode && (
            <div>
              <Label htmlFor="adminCode" className="block text-sm font-medium mb-2 font-opensans" style={{ color: '#52555b' }}>
                Código de Administrador
              </Label>
              <Input
                id="adminCode"
                type="password"
                {...register("adminCode")}
                className={`w-full ${errors.adminCode ? 'border-red-500' : ''}`}
                placeholder="Digite o código administrativo"
              />
              {errors.adminCode && (
                <p className="mt-1 text-sm text-red-600">{errors.adminCode.message}</p>
              )}
            </div>
          )}

          <Button 
            type="submit"
            disabled={!isValid || loading}
            className="w-full text-white py-3 font-opensans disabled:bg-gray-400"
            style={{ backgroundColor: '#d61c00' }}
          >
            {loading ? 'Processando...' : (showAdminCode ? 'Acessar Painel Admin' : 'Acessar Curso')}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => setShowAdminCode(!showAdminCode)}
            className="text-sm font-opensans hover:underline"
            style={{ color: '#d61c00' }}
          >
            {showAdminCode ? 'Acesso de Estudante' : 'Acesso Administrativo'}
          </button>
          
          {showAdminCode && (
            <p className="text-xs text-gray-600 font-opensans">
              Apenas administradores autorizados podem acessar esta área
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
