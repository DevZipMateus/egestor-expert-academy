-- Fase 1: Adicionar sistema de tracking de cursos

-- 1. Adicionar campo slug na tabela courses
ALTER TABLE public.courses 
ADD COLUMN slug text;

-- Gerar slugs automáticos para cursos existentes baseado no título
UPDATE public.courses 
SET slug = lower(regexp_replace(regexp_replace(titulo, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Tornar slug obrigatório e único
ALTER TABLE public.courses 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT courses_slug_unique UNIQUE (slug);

-- Criar índice para otimizar buscas por slug
CREATE INDEX idx_courses_slug ON public.courses(slug);

-- 2. Adicionar tracking de início de curso na tabela progresso_usuario
ALTER TABLE public.progresso_usuario 
ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
ADD COLUMN started_at timestamp with time zone DEFAULT now();

-- Atualizar registros existentes para referenciar o primeiro curso ativo
UPDATE public.progresso_usuario 
SET course_id = (SELECT id FROM public.courses WHERE ativo = true ORDER BY created_at LIMIT 1)
WHERE course_id IS NULL;

-- Tornar course_id obrigatório
ALTER TABLE public.progresso_usuario 
ALTER COLUMN course_id SET NOT NULL;

-- Remover constraint antiga e adicionar nova com course_id
ALTER TABLE public.progresso_usuario 
DROP CONSTRAINT IF EXISTS progresso_usuario_usuario_id_key;

ALTER TABLE public.progresso_usuario 
ADD CONSTRAINT progresso_usuario_usuario_course_unique UNIQUE (usuario_id, course_id);

-- Criar índices para otimizar queries de dashboard
CREATE INDEX idx_progresso_usuario_course_started ON public.progresso_usuario(course_id, started_at);
CREATE INDEX idx_progresso_usuario_course_user ON public.progresso_usuario(course_id, usuario_id);

-- 3. Atualizar RLS policies para incluir course_id
-- As policies existentes já cobrem o necessário, pois verificam usuario_id

-- Comentário: Sistema de tracking implementado. 
-- Cada usuário agora tem um registro único por curso em progresso_usuario
-- com timestamp de quando iniciou o curso.