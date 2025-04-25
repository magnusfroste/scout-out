import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { fetchWebhookSettings } from '@/services/webhookService';
import { Eye, EyeClosed, Google } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  maintenanceMode,
  maintenanceMessage,
  onToggleMode
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (maintenanceMode) {
      toast({
        title: "Maintenance in Progress",
        description: maintenanceMessage,
        variant: "destructive",
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (maintenanceMode) {
      toast({
        title: "Maintenance in Progress",
        description: maintenanceMessage,
        variant: "destructive",
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const webhookSettings = await fetchWebhookSettings();
      console.log('Webhook settings for new user signup:', webhookSettings);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            default_credits: webhookSettings?.default_signup_credits || 25
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link.",
      });
      
      onToggleMode();
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    if (maintenanceMode) {
      toast({
        title: "Maintenance in Progress",
        description: maintenanceMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email profile',
        }
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
        description: error.message || "An error occurred during Google Sign-In",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
      {isSignUp && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button 
              type="button"
              onClick={togglePasswordVisibility} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeClosed className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={maintenanceMode}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </div>
      
      <div className="space-y-4 mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={maintenanceMode}
        >
          <Google className="h-5 w-5" />
          Sign {isSignUp ? 'up' : 'in'} with Google
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
