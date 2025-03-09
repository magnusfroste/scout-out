
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';
import { UserProfile } from '@/services/profileService';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Use our new profile hook
  const { 
    userProfile, 
    loading: profileLoading, 
    refreshUserProfile, 
    updateProfile 
  } = useProfile(user?.id);

  // Combine loading states
  const loading = authLoading || profileLoading;

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setAuthLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          console.log('Initial session found with user:', data.session.user.id);
          setUser(data.session.user);
        } else {
          console.log('No initial session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) {
      refreshUserProfile();
    }
  }, [user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    signOut,
    refreshUserProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
