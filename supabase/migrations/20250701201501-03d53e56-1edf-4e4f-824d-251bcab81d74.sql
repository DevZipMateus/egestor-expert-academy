
-- Criar tabela de cursos
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de módulos dos cursos
CREATE TABLE public.course_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  ordem integer NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar colunas de curso e módulo à tabela slides
ALTER TABLE public.slides 
ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
ADD COLUMN module_id uuid REFERENCES public.course_modules(id) ON DELETE SET NULL;

-- Adicionar colunas de curso e módulo à tabela questions
ALTER TABLE public.questions
ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
ADD COLUMN module_id uuid REFERENCES public.course_modules(id) ON DELETE SET NULL;

-- Habilitar RLS para courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para courses
CREATE POLICY "Admins podem gerenciar cursos" 
  ON public.courses 
  FOR ALL 
  USING (is_admin(auth.uid()));

CREATE POLICY "Todos podem ver cursos ativos" 
  ON public.courses 
  FOR SELECT 
  USING (ativo = true OR is_admin(auth.uid()));

-- Habilitar RLS para course_modules
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para course_modules
CREATE POLICY "Admins podem gerenciar módulos" 
  ON public.course_modules 
  FOR ALL 
  USING (is_admin(auth.uid()));

CREATE POLICY "Todos podem ver módulos ativos" 
  ON public.course_modules 
  FOR SELECT 
  USING (ativo = true OR is_admin(auth.uid()));

-- Inserir o curso Expert eGestor
INSERT INTO public.courses (nome, descricao, ordem) 
VALUES ('Expert eGestor', 'Curso completo sobre o sistema Expert eGestor', 1);

-- Obter o ID do curso inserido para usar nos módulos
DO $$
DECLARE
  course_uuid uuid;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE nome = 'Expert eGestor';
  
  -- Inserir módulos do curso Expert eGestor
  INSERT INTO public.course_modules (course_id, nome, ordem) VALUES
  (course_uuid, 'Clientes e Fornecedores', 1),
  (course_uuid, 'Produtos e Estoque', 2),
  (course_uuid, 'Vendas e Pagamentos', 3),
  (course_uuid, 'Relatórios e Análises', 4),
  (course_uuid, 'Configurações Avançadas', 5);
END $$;
