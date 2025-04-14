import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmailSettings {
  id?: string;
  email_provider: string;
  email_address: string;
  app_password: string;
  smtp_host: string;
  smtp_port: number;
  is_active: boolean;
}

const EMAIL_PROVIDERS = [
  {
    name: 'Gmail',
    value: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    instructions: 'For Gmail, you need to create an App Password. Go to your Google Account > Security > App Passwords.'
  },
  {
    name: 'Outlook',
    value: 'outlook',
    host: 'smtp.office365.com',
    port: 587,
    instructions: 'For Outlook, you need to create an App Password in your Microsoft account security settings.'
  },
  {
    name: 'Yahoo',
    value: 'yahoo',
    host: 'smtp.mail.yahoo.com',
    port: 465,
    instructions: 'For Yahoo, you need to generate an App Password in your Yahoo account security settings.'
  },
  {
    name: 'Custom',
    value: 'custom',
    host: '',
    port: 587,
    instructions: 'Enter your custom SMTP server details.'
  }
];

const EmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    email_provider: '',
    email_address: '',
    app_password: '',
    smtp_host: '',
    smtp_port: 587,
    is_active: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [instructions, setInstructions] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching email settings...');
      fetchEmailSettings();
    }
  }, [user]);

  const fetchEmailSettings = async () => {
    if (!user) return;
    
    console.log('Starting to fetch email settings for user:', user.id);
    setIsLoading(true);
    try {
      // Get the current session to ensure we have fresh auth
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData?.session ? 'Valid' : 'Invalid');
      
      if (!sessionData?.session) {
        console.error('No valid session found');
        return;
      }
      
      // Use RPC call to bypass potential RLS issues
      const { data, error } = await supabase.rpc('get_user_email_settings');
      
      console.log('Email settings query result:', { data, error });
      
      if (error) {
        // If RPC fails, fall back to direct query
        console.log('RPC failed, falling back to direct query');
        const { data: directData, error: directError } = await supabase
          .from('user_email_settings')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        console.log('Direct query result:', { data: directData, error: directError });
        
        if (directError && directError.code !== 'PGRST116') {
          throw directError;
        }
        
        if (directData) {
          console.log('Found email settings via direct query:', directData);
          setSettings({
            id: directData.id,
            email_provider: directData.email_provider,
            email_address: directData.email_address,
            app_password: directData.app_password,
            smtp_host: directData.smtp_host,
            smtp_port: directData.smtp_port,
            is_active: directData.is_active
          });
          setHasSettings(true);
          
          // Set instructions based on provider
          const provider = EMAIL_PROVIDERS.find(p => p.value === directData.email_provider);
          if (provider) {
            setInstructions(provider.instructions);
          }
        } else {
          console.log('No email settings found via direct query');
        }
        return;
      }
      
      if (data) {
        console.log('Found email settings via RPC:', data);
        // Map the database fields to our settings state
        setSettings({
          id: data.id,
          email_provider: data.email_provider,
          email_address: data.email_address,
          app_password: data.app_password,
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          is_active: data.is_active
        });
        setHasSettings(true);
        
        // Set instructions based on provider
        const provider = EMAIL_PROVIDERS.find(p => p.value === data.email_provider);
        if (provider) {
          setInstructions(provider.instructions);
        }
      } else {
        console.log('No email settings found via RPC');
      }
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to load email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    console.log('Provider changed to:', value);
    const provider = EMAIL_PROVIDERS.find(p => p.value === value);
    if (provider) {
      setSettings({
        ...settings,
        email_provider: value,
        smtp_host: provider.value === 'custom' ? '' : provider.host,
        smtp_port: provider.port
      });
      setInstructions(provider.instructions);
      console.log('Updated settings after provider change:', {
        ...settings,
        email_provider: value,
        smtp_host: provider.value === 'custom' ? '' : provider.host,
        smtp_port: provider.port
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'smtp_port' ? parseInt(value) : value
    });
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // First check if settings already exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_email_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingSettings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_email_settings')
          .update({
            email_provider: settings.email_provider,
            email_address: settings.email_address,
            app_password: settings.app_password,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('user_email_settings')
          .insert({
            user_id: user.id,
            email_provider: settings.email_provider,
            email_address: settings.email_address,
            app_password: settings.app_password,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            is_active: true
          })
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      console.log('Email settings saved successfully:', result);
      
      setHasSettings(true);
      toast({
        title: 'Success',
        description: 'Email settings saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!user) return;
    
    setIsTesting(true);
    try {
      // Use the correct URL for your Supabase project
      const response = await fetch(`https://pqskutdrekcinpymvigm.supabase.co/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          emailData: {
            recipient: settings.email_address, // Send test email to self
            subject: 'Test Connection',
            content: 'This is a test email to verify your email settings are working correctly.',
            senderName: 'Your Business'
          },
          userId: user.id
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send test email');
      }
      
      toast({
        title: 'Success',
        description: 'Test email sent successfully. Check your inbox.',
      });
    } catch (error: any) {
      console.error('Error testing email connection:', error);
      toast({
        title: 'Error',
        description: `Failed to send test email: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Settings
        </CardTitle>
        <CardDescription>
          Configure your email settings to send introduction emails directly from the app
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <Mail className="h-4 w-4" />
          <AlertTitle>Email Integration</AlertTitle>
          <AlertDescription>
            This allows you to send emails directly from the app using your own email account.
            You'll need to provide an app password from your email provider.
          </AlertDescription>
        </Alert>
        
        {instructions && (
          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
            <AlertTitle>Provider Instructions</AlertTitle>
            <AlertDescription>
              {instructions}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_provider">Email Provider</Label>
            <Select 
              value={settings.email_provider || ''} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your email provider" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email_address">Email Address</Label>
            <Input
              id="email_address"
              name="email_address"
              type="email"
              value={settings.email_address}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="app_password">App Password</Label>
            <Input
              id="app_password"
              name="app_password"
              type="password"
              value={settings.app_password}
              onChange={handleInputChange}
              onPaste={(e) => {
                // Allow paste operation
                console.log('Password pasted');
              }}
              className="font-mono"
              placeholder="Your app password (not your regular password)"
            />
            <p className="text-xs text-muted-foreground">
              For Gmail, enter the 16-character app password without spaces (e.g., "hldvaxerpuvjvzjt")
            </p>
          </div>
          
          {settings.email_provider === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  name="smtp_host"
                  value={settings.smtp_host}
                  onChange={handleInputChange}
                  placeholder="smtp.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  name="smtp_port"
                  type="number"
                  value={settings.smtp_port.toString()}
                  onChange={handleInputChange}
                  placeholder="587"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-900 p-6">
        <Button 
          variant="outline" 
          onClick={testConnection} 
          disabled={isTesting || isSaving || !settings.email_provider || !settings.email_address || !settings.app_password}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
        
        <Button 
          onClick={saveSettings} 
          disabled={isSaving || !settings.email_provider || !settings.email_address || !settings.app_password}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailSettings;
