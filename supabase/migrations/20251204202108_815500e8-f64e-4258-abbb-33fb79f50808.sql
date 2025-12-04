-- Adicionar foreign key de progresso_usuario para profiles
ALTER TABLE public.progresso_usuario
ADD CONSTRAINT fk_progresso_usuario_profiles
FOREIGN KEY (usuario_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Criar index para otimização de JOINs
CREATE INDEX IF NOT EXISTS idx_progresso_usuario_usuario_id 
ON public.progresso_usuario(usuario_id);