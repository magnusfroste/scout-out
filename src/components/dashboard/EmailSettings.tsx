import React, { useEffect } from 'react';
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
import { 
  Mail,
  Save,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
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
import { initiateO365Auth, handleO365AuthCallback } from '@/services/o365AuthService';
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
    validateForm,
  } = useEmailSettings();

  useEffect(() => {
    checkMigrationStatus();
    fetchEmailSettings();
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
        if (!oauth2ClientId || !oauth2ClientSecret) {
          throw new Error('OAuth2 client ID and client secret are required');
        }
        
        settingsData.oauth2_client_id = oauth2ClientId;
        settingsData.oauth2_client_secret = oauth2ClientSecret;
        
        if (refreshToken) {
          settingsData.oauth2_refresh_token = refreshToken;
        } else if (existingSettings?.oauth2_refresh_token) {
          settingsData.oauth2_refresh_token = existingSettings.oauth2_refresh_token;
        }
        
        settingsData.app_password = 'oauth2_not_used';
      }
      
      let result;
      if (existingSettings) {
        result = await supabase
          .from('user_email_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
          .eq('user_id', user.id);
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
      setIsAuthenticating(true);
      const redirectUri = `${window.location.origin}/settings`;
      await initiateO365Auth(oauth2ClientId, redirectUri);
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

  useEffect(() => {
    const isRedirecting = sessionStorage.getItem('emailSettings_redirecting') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if ((code && isRedirecting) || code) {
      console.log('Authorization code detected in URL, handling callback');
      handleAuthCallback();
    }
  }, [oauth2ClientId, oauth2ClientSecret]);

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
