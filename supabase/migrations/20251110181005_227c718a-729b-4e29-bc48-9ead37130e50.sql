-- Update the handle_new_user trigger to automatically assign admin role to specific emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Create initial progress record
  INSERT INTO public.progresso_usuario (usuario_id, aulas_assistidas, progresso_percentual)
  VALUES (NEW.id, '{}', 0);
  
  -- Determine role based on email
  IF NEW.email IN ('mateus.pinto@zipline.com.br', 'joseph@zipline.com.br') THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;