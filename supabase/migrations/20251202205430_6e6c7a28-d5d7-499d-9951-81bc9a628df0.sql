-- Adicionar campo para armazenar respostas de exercícios
ALTER TABLE public.progresso_usuario
ADD COLUMN IF NOT EXISTS respostas_exercicios jsonb DEFAULT '{}'::jsonb;

-- Comentário para documentação
COMMENT ON COLUMN public.progresso_usuario.respostas_exercicios IS 'Armazena respostas de exercícios no formato { "slide_ordem": { "selectedOption": index, "correct": boolean } }';