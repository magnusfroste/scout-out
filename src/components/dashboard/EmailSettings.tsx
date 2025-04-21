
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Mail,
  Save,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  InfoIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { initiateO365Auth, handleO365AuthCallback, saveOAuth2Tokens } from '@/services/o365AuthService';
import { BasicSettings } from './email-settings/BasicSettings';
import { ServerSettings } from './email-settings/ServerSettings';
import { AuthenticationFields } from './email-settings/AuthenticationFields';

const EmailSettings = () => {
  const {
    emailAddress,
    setEmailAddress,
    emailPassword,
    setEmailPassword,
    emailProvider,
    setEmailProvider,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    authType,
    setAuthType,
    oauth2ClientId,
    setOauth2ClientId,
    oauth2ClientSecret,
    setOauth2ClientSecret,
    existingSettings,
    setExistingSettings,
    isLoading,
    isSaving,
    setIsSaving,
    isDeleting,
    setIsDeleting,
    isAuthenticating,
    setIsAuthenticating,
    oauthColumnsExist,
    checkMigrationStatus,
    fetchEmailSettings,
    resetForm,
    validateForm,
    checkOAuthStatus,
    setHasValidOAuth,
    hasValidOAuth
  } = useEmailSettings();
  
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkMigrationStatus();
    fetchEmailSettings();
    checkOAuthStatus();
  }, []);

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

  const handleSaveSettings = async (refreshToken?: string) => {
    console.group('Save Email Settings');
    console.log('User:', user ? user.id : 'No user');
    console.log('Auth Type:', authType);
    console.log('Email Provider:', emailProvider);
    console.log('SMTP Host:', smtpHost);
    console.log('SMTP Port:', smtpPort);
    console.log('OAuth Columns Exist:', oauthColumnsExist);
    console.log('Has refresh token:', !!refreshToken);

    setDebugInfo(null);

    if (!user) {
      console.error('No user found, cannot save settings');
      toast({
        title: 'Error',
        description: 'You must be logged in to save email settings',
        variant: 'destructive',
      });
      console.groupEnd();
      return;
    }
    
    if (!validateForm()) {
      console.error('Form validation failed');
      console.groupEnd();
      return;
    }
    
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
        console.log('Using Password Authentication');
        if (emailPassword) {
          settingsData.app_password = emailPassword;
        } else if (!existingSettings) {
          console.error('App password required for new settings');
          throw new Error('App password is required for new email settings');
        }
        
        settingsData.oauth2_client_id = null;
        settingsData.oauth2_client_secret = null;
        settingsData.oauth2_refresh_token = null;
      } else if (authType === 'oauth2') {
        console.log('Using OAuth2 Authentication');
        if (!oauth2ClientId || !oauth2ClientSecret) {
          console.error('Missing OAuth2 credentials');
          throw new Error('OAuth2 client ID and client secret are required');
        }
        
        settingsData.oauth2_client_id = oauth2ClientId;
        settingsData.oauth2_client_secret = oauth2ClientSecret;
        
        if (refreshToken) {
          console.log('Adding Refresh Token from recent authentication');
          settingsData.oauth2_refresh_token = refreshToken;
          setHasValidOAuth(true);
        } else if (existingSettings?.oauth2_refresh_token) {
          console.log('Using Existing Refresh Token');
          settingsData.oauth2_refresh_token = existingSettings.oauth2_refresh_token;
        } else {
          console.log('No refresh token available');
        }
        
        settingsData.app_password = 'oauth2_not_used';
      }
      
      console.log('Prepared Settings Data:', settingsData);
      
      let result;
      if (existingSettings) {
        console.log('Updating Existing Settings');
        result = await supabase
          .from('user_email_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
          .eq('user_id', user.id)
          .select('*');
      } else {
        console.log('Creating New Email Settings');
        result = await supabase
          .from('user_email_settings')
          .insert(settingsData)
          .select('*');
      }
      
      if (result.error) {
        console.error('Supabase Error:', result.error);
        throw result.error;
      }
      
      console.log('Save Result:', result.data);
      setDebugInfo(JSON.stringify(result.data, null, 2));
      
      toast({
        title: 'Success',
        description: `Email settings ${existingSettings ? 'updated' : 'saved'} successfully`,
      });
      
      // If we have a refresh token, make sure we update hasValidOAuth
      if (settingsData.oauth2_refresh_token && emailProvider === 'office365') {
        setHasValidOAuth(true);
      }
      
      await fetchEmailSettings();
      setEmailPassword('');
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save email settings: ${error.message}`,
        variant: 'destructive',
      });
      setDebugInfo(JSON.stringify(error, null, 2));
    } finally {
      setIsSaving(false);
      console.groupEnd();
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
      setHasValidOAuth(false);
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
    try {
      setIsAuthenticating(true);
      
      let clientId = oauth2ClientId;
      let clientSecret = oauth2ClientSecret;
      
      if (existingSettings?.oauth2_client_id && existingSettings?.oauth2_client_secret) {
        console.log('Using existing OAuth2 credentials from database');
        clientId = existingSettings.oauth2_client_id;
        clientSecret = existingSettings.oauth2_client_secret;
        
        // Update the form fields to match the stored credentials
        if (!oauth2ClientId) setOauth2ClientId(clientId);
        if (!oauth2ClientSecret) setOauth2ClientSecret(clientSecret);
      } else {
        if (!clientId) {
          toast({
            title: "Missing Client ID",
            description: "Please enter your Azure App Client ID first",
            variant: "destructive",
          });
          setIsAuthenticating(false);
          return;
        }
        
        if (!clientSecret) {
          toast({
            title: "Missing Client Secret",
            description: "Please enter your Azure App Client Secret first",
            variant: "destructive",
          });
          setIsAuthenticating(false);
          return;
        }
      }

      const redirectUri = `${window.location.origin}/settings`;
      console.log('Initiating OAuth2 with redirect URI:', redirectUri);
      console.log('Client ID being used:', clientId);
      console.log('Client Secret length:', clientSecret?.length || 0);
      
      // Clear any previous auth state
      sessionStorage.removeItem('emailSettings_redirecting');
      sessionStorage.removeItem('emailSettings_clientId');
      sessionStorage.removeItem('emailSettings_clientSecret');
      sessionStorage.removeItem('emailSettings_redirectUri');
      
      // Set fresh auth state
      sessionStorage.setItem('emailSettings_redirecting', 'true');
      sessionStorage.setItem('emailSettings_clientId', clientId);
      sessionStorage.setItem('emailSettings_clientSecret', clientSecret);
      sessionStorage.setItem('emailSettings_redirectUri', redirectUri);
      sessionStorage.setItem('emailSettings_userEmail', emailAddress);
      
      await initiateO365Auth(clientId, redirectUri);
    } catch (error) {
      console.error('Error initiating OAuth2:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start authentication process",
        variant: "destructive",
      });
      setIsAuthenticating(false);
    }
  };

  const handleAuthCallback = async () => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      console.log('No auth code found in URL, skipping OAuth callback handling');
      return;
    }

    console.log('Auth code detected, handling OAuth callback');
    setIsAuthenticating(true);
    try {
      const redirectUri = sessionStorage.getItem('emailSettings_redirectUri') || `${window.location.origin}/settings`;
      let clientId = sessionStorage.getItem('emailSettings_clientId');
      let clientSecret = sessionStorage.getItem('emailSettings_clientSecret');
      const userEmail = sessionStorage.getItem('emailSettings_userEmail') || emailAddress;
      
      if (!clientId) clientId = oauth2ClientId;
      if (!clientSecret) clientSecret = oauth2ClientSecret;
      
      if ((!clientId || !clientSecret) && existingSettings) {
        clientId = existingSettings.oauth2_client_id || '';
        clientSecret = existingSettings.oauth2_client_secret || '';
      }
      
      if (!clientId || !clientSecret) {
        console.error('Missing OAuth credentials:', { clientId: !!clientId, clientSecret: !!clientSecret });
        throw new Error('OAuth2 client ID and client secret are required');
      }
      
      console.log('Handling OAuth callback with code');
      const data = await handleO365AuthCallback(
        code, 
        clientId, 
        clientSecret, 
        redirectUri
      );
      
      if (data.refreshToken) {
        console.log('Received refresh token, saving to database directly');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (clientId !== oauth2ClientId) {
          setOauth2ClientId(clientId);
        }
        
        if (clientSecret !== oauth2ClientSecret) {
          setOauth2ClientSecret(clientSecret);
        }
        
        // First try to save tokens directly to database
        if (user) {
          const saved = await saveOAuth2Tokens(
            user.id,
            data.refreshToken,
            clientId,
            clientSecret,
            userEmail
          );
          
          if (saved) {
            console.log('Successfully saved tokens directly to database');
            setHasValidOAuth(true);
            await fetchEmailSettings();
            
            toast({
              title: "Success",
              description: "Successfully authenticated with Office 365",
            });
          } else {
            console.log('Failed to save tokens directly, falling back to form save');
            // Fall back to form save
            await handleSaveSettings(data.refreshToken);
          }
        } else {
          console.log('No user found, using form save method');
          await handleSaveSettings(data.refreshToken);
        }
        
        // Clear session storage
        sessionStorage.removeItem('emailSettings_redirecting');
        sessionStorage.removeItem('emailSettings_clientId');
        sessionStorage.removeItem('emailSettings_clientSecret');
        sessionStorage.removeItem('emailSettings_redirectUri');
        sessionStorage.removeItem('emailSettings_userEmail');
      }
    } catch (error: any) {
      console.error('Error handling OAuth callback:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to complete authentication process",
        variant: "destructive",
      });
      setDebugInfo(JSON.stringify(error, null, 2));
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    const isRedirecting = sessionStorage.getItem('emailSettings_redirecting') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if ((code && isRedirecting) || code) {
      console.log('Authorization code detected in URL, handling callback');
      handleAuthCallback();
    } else {
      console.log('No authorization code in URL or not in redirecting state');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        {!oauthColumnsExist && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Migration Required</AlertTitle>
            <AlertDescription>
              The OAuth2 columns have not been added to the database yet. 
              Please ensure you've run the SQL migration scripts for OAuth2 support.
            </AlertDescription>
          </Alert>
        )}

        <BasicSettings
          emailAddress={emailAddress}
          emailProvider={emailProvider}
          onEmailAddressChange={setEmailAddress}
          onEmailProviderChange={setEmailProvider}
        />
        
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
            
            <AuthenticationFields
              authType={authType}
              emailPassword={emailPassword}
              existingSettings={existingSettings}
              oauth2ClientId={oauth2ClientId}
              oauth2ClientSecret={oauth2ClientSecret}
              oauthColumnsExist={oauthColumnsExist}
              isAuthenticating={isAuthenticating}
              onEmailPasswordChange={setEmailPassword}
              onOauth2ClientIdChange={setOauth2ClientId}
              onOauth2ClientSecretChange={setOauth2ClientSecret}
              onInitiateOAuth2={initiateOAuth2}
            />
          </div>
        )}
        
        <ServerSettings
          smtpHost={smtpHost}
          smtpPort={smtpPort}
          onSmtpHostChange={setSmtpHost}
          onSmtpPortChange={setSmtpPort}
        />
        
        {existingSettings && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Email settings configured</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You can now send emails directly from the app using {existingSettings.email_address}
            </p>
            {emailProvider === 'office365' && (
              <div className="mt-2 text-sm">
                <div className="flex items-center">
                  <strong className="mr-2">OAuth status:</strong> 
                  {hasValidOAuth ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Valid token
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Missing or invalid token
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="flex items-center text-muted-foreground mb-2">
              <InfoIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Debug Information</span>
            </div>
            <pre className="text-xs overflow-auto max-h-32">{debugInfo}</pre>
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
            
            <Button onClick={() => handleSaveSettings()} disabled={isSaving || isDeleting}>
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
          <Button onClick={() => handleSaveSettings()} disabled={isSaving} className="ml-auto">
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
