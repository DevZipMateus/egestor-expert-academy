
-- Criar enum para roles de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- Criar tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela de slides
CREATE TABLE public.slides (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT,
  video_url TEXT,
  ordem INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de perguntas
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id INTEGER REFERENCES public.slides(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  explicacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de opções de perguntas
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  correta BOOLEAN DEFAULT false,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver seu próprio role" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem inserir roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para slides
CREATE POLICY "Todos podem ver slides ativos" 
  ON public.slides 
  FOR SELECT 
  USING (ativo = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins podem gerenciar slides" 
  ON public.slides 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para questions
CREATE POLICY "Todos podem ver perguntas" 
  ON public.questions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins podem gerenciar perguntas" 
  ON public.questions 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para question_options
CREATE POLICY "Todos podem ver opções" 
  ON public.question_options 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins podem gerenciar opções" 
  ON public.question_options 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Inserir role de admin para o usuário específico
-- Nota: Este INSERT será executado após o usuário fazer login pela primeira vez
-- Por enquanto, vamos criar um trigger para automatizar isso

-- Função para criar role de admin para email específico
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o email é o admin
  IF NEW.email = 'mateus.pinto@zipline.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para automatizar a criação de roles
CREATE TRIGGER on_auth_user_created_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();

-- Inserir slides existentes na tabela (baseado no courseData.ts)
INSERT INTO public.slides (id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
(1, 'Introdução ao Curso', 'content', 'Bem-vindos ao nosso curso completo!', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 1, true),
(2, 'Exercício 1', 'exercise', 'Primeira atividade prática', null, 2, true),
(3, 'Atenção Importante', 'attention', 'Informação crítica para o curso', null, 3, true),
(4, 'Conteúdo Principal', 'content', 'Material principal do curso', null, 4, true),
(5, 'Exercício 2', 'exercise', 'Segunda atividade prática', null, 5, true);

-- Adicionar mais slides conforme necessário (simplificado para exemplo)
-- Em produção, você pode migrar todos os 47 slides do courseData.ts
