
-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover a função existente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar nova função que gerencia ambas as tabelas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Primeiro, inserir na tabela usuarios
  INSERT INTO public.usuarios (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Depois, inserir na tabela progresso_usuario
  INSERT INTO public.progresso_usuario (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Também precisamos ajustar a foreign key constraint para apontar para usuarios ao invés de auth.users
ALTER TABLE public.progresso_usuario 
DROP CONSTRAINT IF EXISTS progresso_usuario_usuario_id_fkey;

ALTER TABLE public.progresso_usuario 
ADD CONSTRAINT progresso_usuario_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
