
-- Criar tabela de usuários
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de progresso do usuário
CREATE TABLE public.progresso_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  ultima_aula INTEGER DEFAULT 1,
  aulas_assistidas INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  progresso_percentual DECIMAL(5,2) DEFAULT 0.00,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_usuario ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para usuários
CREATE POLICY "Usuários podem ver seus próprios dados" 
  ON public.usuarios 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
  ON public.usuarios 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios dados" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Criar políticas RLS para progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" 
  ON public.progresso_usuario 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso" 
  ON public.progresso_usuario 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso" 
  ON public.progresso_usuario 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

-- Criar função para inserir progresso inicial quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.progresso_usuario (usuario_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para inserir progresso inicial
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
