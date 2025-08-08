import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEV_AUTH_KEY = 'dev_auth_override';
const DEV_SUBS_KEY = 'dev_subscription_plan';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  signUp: (email: string, password: string, djName?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  logout: () => void;
  devLogin: (email: string, plan: 'free' | 'premium' | 'pro') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast({ title: "Bem-vindo! 🎧", description: "Login realizado com sucesso." });
          // Check subscription after login
          setTimeout(async () => {
            try { await supabase.functions.invoke('check-subscription'); } catch (error) { console.error('Error checking subscription on login:', error); }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          toast({ title: "Até logo! ✨", description: "Logout realizado com sucesso." });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        // Fallback to dev override
        const raw = localStorage.getItem(DEV_AUTH_KEY);
        if (raw) {
          try {
            const dev = JSON.parse(raw) as { email: string };
            const fakeUser = { id: 'dev-user', email: dev.email } as unknown as User;
            setUser(fakeUser);
          } catch {}
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, djName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          dj_name: djName || 'DJ User'
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada! 🎉",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem(DEV_AUTH_KEY);
    localStorage.removeItem(DEV_SUBS_KEY);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erro no logout", description: error.message, variant: "destructive" });
    }
  };
  const devLogin = (email: string, plan: 'free' | 'premium' | 'pro') => {
    localStorage.setItem(DEV_AUTH_KEY, JSON.stringify({ email }));
    localStorage.setItem(DEV_SUBS_KEY, plan);
    const fakeUser = { id: 'dev-user', email } as unknown as User;
    setUser(fakeUser);
    setSession(null);
    toast({ title: `Login de teste (${plan})`, description: `Autenticado como ${email}` });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: !!user,
      email: user?.email ?? null,
      signUp,
      signIn,
      signOut,
      logout: signOut,
      devLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}