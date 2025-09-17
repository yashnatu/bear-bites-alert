
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const processedUserRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Reset processed user ref when auth state changes
        if (event === 'SIGNED_OUT') {
          processedUserRef.current = null;
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

  // Enforce @berkeley.edu Google account and terms acceptance
  useEffect(() => {
    const checkTermsAndProfile = async () => {
      if (user && user.email && !loading && processedUserRef.current !== user.id) {
        processedUserRef.current = user.id;
        if (!user.email.endsWith('@berkeley.edu')) {
          await signOut();
          navigate('/error', { replace: true });
          return;
        }
        // Check if profile exists (should be created automatically by trigger)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        // If profile doesn't exist (fallback - should not happen with trigger)
        if (profileError && profileError.code === 'PGRST116') {
          console.warn('Profile not found for user, creating manually (trigger may not be working)');
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            club_email: user.email,
            club_name: user.user_metadata?.full_name || '',
            terms_accepted: false,
          });
          if (insertError) {
            console.error('Failed to create profile:', insertError);
          }
        }
        // Check terms acceptance
        const { data, error } = await supabase
          .from('profiles')
          .select('terms_accepted')
          .eq('id', user.id)
          .single();
        if (!error && data && !data.terms_accepted) {
          // Preserve redirect path through terms acceptance
          const redirectPath = localStorage.getItem('postSignInRedirect');
          if (redirectPath) {
            // Don't remove from localStorage yet, let Terms page handle it
            navigate('/terms?redirect=' + encodeURIComponent(redirectPath), { replace: true });
          } else {
            navigate('/terms', { replace: true });
          }
          return;
        }
        // Handle post-sign-in redirect
        const redirectPath = localStorage.getItem('postSignInRedirect');
        if (redirectPath) {
          localStorage.removeItem('postSignInRedirect');
          navigate(redirectPath, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    };
    checkTermsAndProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signInWithGoogle,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
