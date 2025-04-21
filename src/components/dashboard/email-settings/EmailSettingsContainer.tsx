
import React, { useEffect, useState } from 'react';
import { Mail, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { BasicSettings } from './BasicSettings';
import { ServerSettings } from './ServerSettings';
import { AuthenticationFields } from './AuthenticationFields';
import { EmailSettingsDebug } from './EmailSettingsDebug';
import { EmailSettingsActions } from './EmailSettingsActions';
import { EmailSettingsStatus } from './EmailSettingsStatus';
import { OAuth2Handler } from './OAuth2Handler';
import { MigrationAlert } from './MigrationAlert';
import { useEmailSettingsForm } from '@/hooks/useEmailSettingsForm';
import { OAuth2Settings } from './OAuth2Settings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleO365AuthCallback } from '@/services/oauth/oauthFlowService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailSettingsContainer = () => {
  const [error, setError] = useState<string | null>(null);
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
    isAuthenticating,
    oauthColumnsExist,
    hasValidOAuth,
    setHasValidOAuth,
    checkOAuthStatus,
    fetchEmailSettings,
    validateForm,
  } = useEmailSettings();

  const {
    isSaving,
    isDeleting,
    handleSaveSettings,
    handleDeleteSettings,
  } = useEmailSettingsForm(
    emailAddress,
    emailPassword,
    emailProvider,
    smtpHost,
    smtpPort,
    authType,
    oauth2ClientId,
    oauth2ClientSecret,
    existingSettings,
    hasValidOAuth,
    setHasValidOAuth,
    fetchEmailSettings,
    validateForm
  );

  const { handleInitiateOAuth } = OAuth2Settings({
    oauth2ClientId,
    emailAddress,
    validateForm,
  });

  const { toast } = useToast();
  
  // Define handleAuthCallback function to process OAuth callbacks
  const handleAuthCallback = async () => {
    console.log('Handling OAuth callback');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      console.error('No authorization code found in URL');
      sessionStorage.removeItem('emailSettings_redirecting');
      return;
    }
    
    try {
      // Get stored values from session storage
      const clientId = sessionStorage.getItem('emailSettings_clientId');
      const redirectUri = sessionStorage.getItem('emailSettings_redirectUri');
      const userEmail = sessionStorage.getItem('emailSettings_userEmail');
      
      if (!clientId || !redirectUri) {
        throw new Error('Missing OAuth configuration. Please try again.');
      }

      // Use existing client secret if available, otherwise prompt user
      let clientSecret = oauth2ClientSecret;
      if (!clientSecret && existingSettings?.oauth2_client_secret) {
        clientSecret = existingSettings.oauth2_client_secret;
      }
      
      if (!clientSecret) {
        throw new Error('Client secret is required to complete authentication');
      }

      // Exchange authorization code for tokens
      const tokens = await handleO365AuthCallback(code, clientId, clientSecret, redirectUri);
      console.log('Received tokens from authorization code exchange');
      
      // Save the tokens to the database
      if (tokens.refreshToken) {
        console.log('Saving refresh token to database');
        await handleSaveSettings(tokens.refreshToken);
        toast({
          title: 'Authentication Successful',
          description: 'Successfully authenticated with Microsoft 365',
        });
      }
      
      // Clean up session storage
      sessionStorage.removeItem('emailSettings_redirecting');
      sessionStorage.removeItem('emailSettings_clientId');
      sessionStorage.removeItem('emailSettings_redirectUri');
      sessionStorage.removeItem('emailSettings_userEmail');
      
      // Remove code from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check OAuth status
      checkOAuthStatus();
    } catch (error: any) {
      console.error('Error handling OAuth callback:', error);
      setError(error.message || 'Failed to complete authentication process');
      
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to complete authentication process',
        variant: 'destructive',
      });
      
      // Clean up session storage
      sessionStorage.removeItem('emailSettings_redirecting');
      sessionStorage.removeItem('emailSettings_clientId');
      sessionStorage.removeItem('emailSettings_redirectUri');
    }
  };

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
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!oauthColumnsExist && <MigrationAlert />}

        <BasicSettings
          emailAddress={emailAddress}
          emailProvider={emailProvider}
          onEmailAddressChange={setEmailAddress}
          onEmailProviderChange={setEmailProvider}
        />
        
        {emailProvider && (
          <>
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
              onInitiateOAuth2={handleInitiateOAuth}
            />
            
            <ServerSettings
              smtpHost={smtpHost}
              smtpPort={smtpPort}
              onSmtpHostChange={setSmtpHost}
              onSmtpPortChange={setSmtpPort}
            />
          </>
        )}
        
        {existingSettings && (
          <EmailSettingsStatus 
            settings={existingSettings} 
            hasValidOAuth={hasValidOAuth} 
          />
        )}
        
        <EmailSettingsDebug debugInfo={null} />
      </CardContent>

      <CardFooter className="flex justify-between">
        <EmailSettingsActions
          existingSettings={existingSettings}
          isDeleting={isDeleting}
          isSaving={isSaving}
          onDelete={handleDeleteSettings}
          onSave={() => handleSaveSettings()}
        />
      </CardFooter>
      
      <OAuth2Handler onAuthCallback={handleAuthCallback} />
    </Card>
  );
};

export default EmailSettingsContainer;
