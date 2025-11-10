-- Adicionar constraint UNIQUE para garantir que cada aluno tenha apenas um certificado por curso
ALTER TABLE public.certificates 
ADD CONSTRAINT unique_user_course_certificate UNIQUE (user_id, course_id);

-- Criar índice para melhorar performance em consultas
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON public.certificates(user_id, course_id);

-- Comentário explicativo
COMMENT ON CONSTRAINT unique_user_course_certificate ON public.certificates IS 
'Garante que cada usuário pode ter apenas um certificado por curso';
