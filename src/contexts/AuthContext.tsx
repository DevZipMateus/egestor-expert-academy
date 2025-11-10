import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithMagicLink: (email: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
  isAuthenticated: false,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create/update profile when user signs in via magic link
        if (event === 'SIGNED_IN' && session?.user) {
          const storedName = localStorage.getItem('pending_user_name');
          if (storedName) {
            setTimeout(async () => {
              try {
                await supabase.from('profiles').upsert({
                  id: session.user.id,
                  email: session.user.email!,
                  nome: storedName,
                  updated_at: new Date().toISOString(),
                });
                localStorage.removeItem('pending_user_name');
              } catch (error) {
                console.error('Error creating profile:', error);
              }
            }, 0);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/introducao`;
    
    // Store name temporarily to create profile after magic link callback
    localStorage.setItem('pending_user_name', nome);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, session, signInWithMagicLink, signOut, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
