
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthForm from '@/components/auth/AuthForm';
import MaintenanceAlert from '@/components/auth/MaintenanceAlert';
import AuthHeader from '@/components/auth/AuthHeader';
import ToggleAuthMode from '@/components/auth/ToggleAuthMode';

// Maintenance mode can be toggled here
const MAINTENANCE_MODE = true; // Set to false when maintenance is complete
const MAINTENANCE_MESSAGE = "We're currently performing maintenance on our authentication system. Please try again later.";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in - silently redirect without messages
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        console.log('User already has session, redirecting to dashboard');
        navigate('/dashboard');
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          console.log('Auth state changed, user logged in, redirecting to dashboard');
          navigate('/dashboard');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 border border-border">
          {MAINTENANCE_MODE && (
            <MaintenanceAlert message={MAINTENANCE_MESSAGE} />
          )}
          
          <AuthHeader isSignUp={isSignUp} />
          
          <AuthForm 
            isSignUp={isSignUp} 
            maintenanceMode={MAINTENANCE_MODE}
            maintenanceMessage={MAINTENANCE_MESSAGE}
            onToggleMode={handleToggleMode}
          />
          
          <ToggleAuthMode 
            isSignUp={isSignUp} 
            onToggle={handleToggleMode} 
            disabled={MAINTENANCE_MODE}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
