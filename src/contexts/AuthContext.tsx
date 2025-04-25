
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
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<boolean>;
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
    const initializeAuth = async () => {
      try {
        setAuthLoading(true);
        
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.id);
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setAuthLoading(false);
          }
        );
        
        // Then check for existing session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          console.log('Initial session found with user:', data.session.user.id);
          setUser(data.session.user);
        } else {
          console.log('No initial session found');
          setUser(null);
        }
        
        setAuthLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setAuthLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) {
      console.log('Refreshing user profile for user ID:', user.id);
      refreshUserProfile();
    }
  }, [user, refreshUserProfile]);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error in signOut:', error);
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      console.log('Sign out successful');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error signing out:', error);
      return Promise.reject(error);
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
