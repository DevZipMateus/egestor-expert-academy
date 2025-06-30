
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Por favor, insira um e-mail válido"),
});

type FormData = z.infer<typeof formSchema>;

const Cadastro = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    console.log("Dados do cadastro:", data);
    toast.success("Cadastro realizado com sucesso!");
    navigate('/curso/1');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao eGestor Expert Academy
          </h1>
          <p className="text-gray-600">
            Preencha seus dados para começar o curso
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
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
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço de e-mail
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

          <Button 
            type="submit"
            disabled={!isValid}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3"
          >
            Começar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
