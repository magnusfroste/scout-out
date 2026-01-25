
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Provider } from '@supabase/supabase-js';
import { Separator } from '@/components/ui/separator';
import { Play } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  onToggleMode: () => void;
}

// Demo account credentials
const DEMO_EMAIL = 'scoutout@liteit.se';
const DEMO_PASSWORD = 'ScoutOutDemo2024!';

const AuthForm: React.FC<AuthFormProps> = ({ 
  isSignUp, 
  maintenanceMode,
  maintenanceMessage,
  onToggleMode 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (maintenanceMode) {
      toast({
        title: "Maintenance Mode",
        description: maintenanceMessage,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "Check your email for a confirmation link."
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "You have been signed in."
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (maintenanceMode) {
      toast({
        title: "Maintenance Mode",
        description: maintenanceMessage,
        variant: "destructive"
      });
      return;
    }

    try {
      setDemoLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome to the Demo!",
        description: "You're now logged in with the demo account. You have 10 credits that reset daily."
      });
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo Login Error",
        description: error.message || "Could not log in to demo account.",
        variant: "destructive"
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (maintenanceMode) {
      toast({
        title: "Maintenance Mode",
        description: maintenanceMessage,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Starting Google authentication process");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      console.log("Google auth initiated successfully - awaiting redirect");
      // Success is handled by the auth state change listener in AuthContext
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during Google authentication.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Account Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="text-center mb-3">
          <p className="text-sm font-medium text-primary">Try ScoutOut</p>
          <p className="text-xs text-muted-foreground">10 credits daily, no signup required</p>
        </div>
        <Button
          type="button"
          variant="default"
          className="w-full gap-2"
          onClick={handleDemoLogin}
          disabled={demoLoading || loading || maintenanceMode}
        >
          <Play className="h-4 w-4" />
          {demoLoading ? 'Logging in...' : 'Try Demo Account'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or {isSignUp ? 'create account' : 'sign in'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading || demoLoading || maintenanceMode}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading || demoLoading || maintenanceMode}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || demoLoading || maintenanceMode}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading || demoLoading || maintenanceMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-4 w-4 mr-2">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Sign {isSignUp ? 'up' : 'in'} with Google
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
