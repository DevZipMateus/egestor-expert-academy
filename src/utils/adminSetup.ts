
import { supabase } from "@/integrations/supabase/client";

export const ensureAdminAccount = async () => {
  const adminEmail = 'mateus.pinto@zipline.com.br';
  const adminPassword = 'zipline';

  try {
    // Tentar fazer login primeiro para ver se a conta já existe
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInData.user) {
      console.log('Conta admin já existe e está funcionando');
      return { success: true, user: signInData.user };
    }

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('Tentando criar conta admin...');
      
      // Tentar criar a conta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) {
        console.error('Erro ao criar conta admin:', signUpError);
        return { success: false, error: signUpError };
      }

      if (signUpData.user) {
        console.log('Conta admin criada com sucesso');
        
        // Inserir na tabela usuarios
        const { error: userInsertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: signUpData.user.id,
              nome: 'Mateus Pinto',
              email: adminEmail,
            }
          ]);

        if (userInsertError) {
          console.error('Erro ao inserir admin na tabela usuarios:', userInsertError);
        }

        // O trigger já deve ter criado o role admin automaticamente
        return { success: true, user: signUpData.user };
      }
    }

    return { success: false, error: signInError };
  } catch (error) {
    console.error('Erro ao configurar conta admin:', error);
    return { success: false, error };
  }
};
