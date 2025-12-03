-- Adicionar 'funcionario' ao enum app_role
ALTER TYPE app_role ADD VALUE 'funcionario';

-- Atualizar função handle_new_user para atribuir role funcionario para emails @zipline.com.br
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  
  -- Determine role based on email
  IF NEW.email IN ('mateus.pinto@zipline.com.br', 'joseph@zipline.com.br') THEN
    user_role := 'admin';
  ELSIF NEW.email LIKE '%@zipline.com.br' THEN
    user_role := 'funcionario';
  ELSE
    user_role := 'user';
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;