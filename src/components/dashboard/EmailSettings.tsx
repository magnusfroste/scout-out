import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Mail,
  Server, 
  Key,
  Save,
  Trash2,
  Settings as SettingsIcon,
  Plus,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettings as EmailSettingsType } from '@/types/email';
import { initiateO365Auth, handleO365AuthCallback } from '@/services/o365AuthService';

interface CompleteEmailSettings extends EmailSettingsType {
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
}

const EmailSettings = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailProvider, setEmailProvider] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [authType, setAuthType] = useState<'password' | 'oauth2'>('password');
  
  const [oauth2ClientId, setOauth2ClientId] = useState('');
  const [oauth2ClientSecret, setOauth2ClientSecret] = useState('');
  
  const [existingSettings, setExistingSettings] = useState<CompleteEmailSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmailSettings();
    }
  }, [user]);

  useEffect(() => {
    if (emailProvider === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort('587');
      setAuthType('password');
    } else if (emailProvider === 'outlook') {
      setSmtpHost('smtp-mail.outlook.com');
      setSmtpPort('587');
      setAuthType('password');
    } else if (emailProvider === 'office365') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort('587');
      setAuthType('oauth2');
    } else if (emailProvider === 'yahoo') {
      setSmtpHost('smtp.mail.yahoo.com');
      setSmtpPort('587');
      setAuthType('password');
    }
  }, [emailProvider]);

  const fetchEmailSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_email_settings');
      
      if (error) throw error;
      
      console.log('Fetched email settings:', data);
      
      if (data && data.length > 0) {
        const settings = data[0] as CompleteEmailSettings;
        setExistingSettings(settings);
        setEmailAddress(settings.email_address);
        setEmailProvider(settings.email_provider);
        setSmtpHost(settings.smtp_host);
        setSmtpPort(settings.smtp_port.toString());
        
        if (settings.oauth2_client_id) {
          setOauth2ClientId(settings.oauth2_client_id);
          setAuthType('oauth2');
        }
        
        if (settings.oauth2_client_secret) {
          setOauth2ClientSecret(settings.oauth2_client_secret);
        }
      } else {
        setExistingSettings(null);
        resetForm();
      }
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email settings: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailAddress('');
    setEmailPassword('');
    setEmailProvider('');
    setSmtpHost('');
    setSmtpPort('');
    setOauth2ClientId('');
    setOauth2ClientSecret('');
    setAuthType('password');
  };

  const validateForm = () => {
    if (!emailAddress || !emailProvider || !smtpHost || !smtpPort) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }
    
    if (authType === 'password') {
      if (!existingSettings && !emailPassword) {
        toast({
          title: 'Missing Password',
          description: 'Please provide an app password',
          variant: 'destructive',
        });
        return false;
      }
    } else if (authType === 'oauth2') {
      if (!oauth2ClientId || !oauth2ClientSecret) {
        toast({
          title: 'Missing OAuth2 Credentials',
          description: 'Please provide all OAuth2 credentials',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSaveSettings = async (refreshToken?: string) => {
    if (!user) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const settingsData: any = {
        email_address: emailAddress,
        email_provider: emailProvider,
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort),
        is_active: true,
        user_id: user.id
      };
      
      if (authType === 'password') {
        if (emailPassword) {
          settingsData.app_password = emailPassword;
        } else if (!existingSettings) {
          throw new Error('App password is required for new email settings');
        }
        
        settingsData.oauth2_client_id = null;
        settingsData.oauth2_client_secret = null;
        settingsData.oauth2_refresh_token = null;
      } else if (authType === 'oauth2') {
        settingsData.oauth2_client_id = oauth2ClientId;
        settingsData.oauth2_client_secret = oauth2ClientSecret;
        if (refreshToken) {
          settingsData.oauth2_refresh_token = refreshToken;
        }
        
        if (!existingSettings || !existingSettings.app_password) {
          settingsData.app_password = 'oauth2_not_used';
        }
      }
      
      let result;
      
      if (existingSettings) {
        if (authType === 'password' && emailPassword) {
          result = await supabase
            .from('user_email_settings')
            .update(settingsData)
            .eq('id', existingSettings.id)
            .eq('user_id', user.id);
        } else {
          const updateData = { ...settingsData };
          if (authType === 'password' && !emailPassword) {
            delete updateData.app_password;
          }
          
          result = await supabase
            .from('user_email_settings')
            .update(updateData)
            .eq('id', existingSettings.id)
            .eq('user_id', user.id);
        }
      } else {
        result = await supabase
          .from('user_email_settings')
          .insert(settingsData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: `Email settings ${existingSettings ? 'updated' : 'saved'} successfully`,
      });
      
      fetchEmailSettings();
      setEmailPassword('');
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

  const handleDeleteSettings = async () => {
    if (!user || !existingSettings) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('user_email_settings')
        .delete()
        .eq('id', existingSettings.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Email settings deleted successfully',
      });
      
      setExistingSettings(null);
      resetForm();
    } catch (error: any) {
      console.error('Error deleting email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to delete email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const initiateOAuth2 = async () => {
    if (!oauth2ClientId) {
      toast({
        title: "Missing Client ID",
        description: "Please enter your Azure App Client ID first",
        variant: "destructive",
      });
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/settings`;
      await initiateO365Auth(oauth2ClientId, redirectUri);
    } catch (error) {
      console.error('Error initiating OAuth2:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start authentication process",
        variant: "destructive",
      });
    }
  };

  const handleAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: "Authentication Error",
        description: `Failed to authenticate: ${error}`,
        variant: "destructive",
      });
      return;
    }

    if (code && oauth2ClientId && oauth2ClientSecret) {
      setIsAuthenticating(true);
      try {
        const redirectUri = `${window.location.origin}/settings`;
        const result = await handleO365AuthCallback(
          code,
          oauth2ClientId,
          oauth2ClientSecret,
          redirectUri
        );

        if (result.refresh_token) {
          await handleSaveSettings(result.refresh_token);
          toast({
            title: "Success",
            description: "Successfully authenticated with Office 365",
          });
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication",
          variant: "destructive",
        });
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  useEffect(() => {
    handleAuthCallback();
  }, [oauth2ClientId, oauth2ClientSecret]);

  const renderAuthFields = () => {
    if (authType === 'password') {
      return (
        <div className="space-y-2">
          <Label htmlFor="emailPassword">
            App Password {existingSettings ? '(Leave blank to keep current password)' : ''}
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="emailPassword"
              type="password"
              placeholder="App password (not your regular email password)"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Use an app-specific password, not your main account password. 
            <a 
              href="https://support.google.com/mail/answer/185833" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              How to generate an app password
            </a>
          </p>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium flex items-center">
            OAuth2 Configuration 
            <a 
              href="https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline text-sm inline-flex items-center"
            >
              <span>Microsoft Azure App Registration Guide</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="oauth2ClientId">Client ID</Label>
            <Input
              id="oauth2ClientId"
              placeholder="Enter your Microsoft Azure app Client ID"
              value={oauth2ClientId}
              onChange={(e) => setOauth2ClientId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oauth2ClientSecret">Client Secret</Label>
            <Input
              id="oauth2ClientSecret"
              type="password"
              placeholder="Enter your Microsoft Azure app Client Secret"
              value={oauth2ClientSecret}
              onChange={(e) => setOauth2ClientSecret(e.target.value)}
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Redirect URIs to configure in Azure:</strong><br />
              • {window.location.origin}/settings<br />
              • {window.location.origin}/auth/callback
            </p>
          </div>

          {!existingSettings?.oauth2_refresh_token && (
            <Button 
              type="button" 
              onClick={initiateOAuth2}
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Connect to Office 365
                </>
              )}
            </Button>
          )}
          
          <p className="text-sm text-muted-foreground">
            You need to register an application in the Microsoft Azure portal and obtain these credentials.
            The app must have the SMTP.Send permission.
          </p>
        </div>
      );
    }
  };

  const handleSaveButtonClick = () => {
    handleSaveSettings();
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          Email Settings
        </CardTitle>
        <CardDescription>
          Configure your email account to send emails directly from the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emailAddress"
                    placeholder="your-email@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select value={emailProvider} onValueChange={setEmailProvider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="office365">Office 365</SelectItem>
                    <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {emailProvider && (
              <div>
                {emailProvider === 'office365' ? (
                  <div className="flex justify-between items-center mb-2">
                    <Label>Authentication Method</Label>
                    <div className="text-xs text-blue-600">
                      Office 365 requires OAuth2 authentication
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-2">
                    <Label>Authentication Method</Label>
                    <div>
                      <Tabs value={authType} onValueChange={(value) => setAuthType(value as 'password' | 'oauth2')}>
                        <TabsList className="grid w-[200px] grid-cols-2">
                          <TabsTrigger value="password">Password</TabsTrigger>
                          <TabsTrigger value="oauth2">OAuth2</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                )}
                
                {renderAuthFields()}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="smtpHost"
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  placeholder="587"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value.replace(/\D/g, ''))}
                  type="number"
                />
              </div>
            </div>
            
            {existingSettings && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Email settings configured</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You can now send emails directly from the app using {existingSettings.email_address}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {existingSettings ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || isSaving}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Settings
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Email Settings</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your email settings? You won't be able to send emails until you configure new settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSettings} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button onClick={handleSaveButtonClick} disabled={isSaving || isDeleting}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Settings
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={handleSaveButtonClick} disabled={isSaving} className="ml-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailSettings;
