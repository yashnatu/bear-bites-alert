
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

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

// Helper function to test database connection
const testDatabaseConnection = async () => {
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    console.log('Database connection test:', { data, error });
    
    if (error) {
      console.error('Database error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('❌ CRITICAL: profiles table does not exist! Migrations may not be applied.');
        return 'table_missing';
      }
    }
    
    return !error;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
};

// Helper function to create a profile
const createUserProfile = async (user: User) => {
  console.log('Creating profile for user:', user.id);
  console.log('User email:', user.email);
  console.log('User metadata:', user.user_metadata);
  
  const profileData = {
    id: user.id,
    club_email: user.email!,
    club_name: user.user_metadata?.full_name || 
               user.user_metadata?.name || 
               user.user_metadata?.display_name || '',
    terms_accepted: false,
  };
  
  console.log('Profile data to insert:', profileData);
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();
    
  if (error) {
    console.error('Profile creation failed:', error);
    throw error;
  }
  
  console.log('Profile created successfully:', data);
  return data;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const processedUserRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Test database connection on initialization
    testDatabaseConnection().then(result => {
      if (result === 'table_missing') {
        console.error('🚨 SETUP REQUIRED: Run "supabase migration up" to create the profiles table');
        toast({
          title: "Database Setup Required",
          description: "The database needs to be set up. Please contact the administrator.",
          variant: "destructive",
        });
      } else if (result === false) {
        console.error('🚨 DATABASE CONNECTION FAILED');
        toast({
          title: "Database Connection Error",
          description: "Unable to connect to the database. Please try again later.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Database connection successful');
      }
    });
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
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
        console.log('Checking profile for user:', user.id, user.email);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        console.log('Profile check result:', { profile, profileError });
        
        // If profile doesn't exist (fallback - should not happen with trigger)
        if (profileError) {
          console.warn('Profile not found for user, creating manually. Error:', profileError);
          
          try {
            await createUserProfile(user);
          } catch (createError) {
            console.error('Failed to create profile manually:', createError);
            
            // If profile creation fails, we might have a serious issue
            // Let's try to continue but show an error
            toast({
              title: "Profile Creation Error",
              description: "There was an issue setting up your profile. Please contact support if this persists.",
              variant: "destructive",
            });
            
            // Don't block the user completely, but log the issue
            console.error('Profile creation error details:', {
              userId: user.id,
              email: user.email,
              error: createError
            });
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
