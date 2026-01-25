
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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

      </form>
    </div>
  );
};

export default AuthForm;
