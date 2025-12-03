-- Remove o constraint antigo e adiciona novo com 'content' incluído
ALTER TABLE public.slides DROP CONSTRAINT slides_tipo_check;

ALTER TABLE public.slides ADD CONSTRAINT slides_tipo_check 
CHECK (tipo = ANY (ARRAY['video'::text, 'exercise'::text, 'attention'::text, 'exam'::text, 'database-exercise'::text, 'content'::text]));