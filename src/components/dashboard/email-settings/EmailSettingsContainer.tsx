
import React, { useEffect, useState } from 'react';
import { Mail, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { handleO365AuthCallback } from '@/services/oauth/oauthFlowService';
import { saveOAuth2Tokens } from '@/services/oauth/tokenService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OAuth2Settings } from './OAuth2Settings';

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

  // Use the OAuth2Settings hook to get the handleInitiateOAuth function
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

      // Show loading toast for token exchange
      toast({
        title: 'Processing Authentication',
        description: 'Exchanging authorization code for tokens...',
      });

      // Exchange authorization code for tokens
      const tokens = await handleO365AuthCallback(code, clientId, clientSecret, redirectUri);
      console.log('✅ Successfully received tokens from Microsoft');
      
      // Show success toast for token reception
      toast({
        title: 'Tokens Received',
        description: 'Successfully received authentication tokens from Microsoft',
      });
      
      // Save the tokens to the database
      if (tokens.refreshToken) {
        toast({
          title: 'Saving Tokens',
          description: 'Saving authentication tokens to database...',
        });
        
        console.log('💾 Starting token save to database');
        
        // Get current user for proper RLS compliance
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User session expired during token save. Please try again.');
        }
        
        // Use the enhanced saveOAuth2Tokens function
        const saveResult = await saveOAuth2Tokens(
          user.id,
          tokens.refreshToken,
          clientId,
          clientSecret,
          userEmail || ''
        );
        
        if (saveResult.success) {
          // Refresh settings after successful save
          await fetchEmailSettings();
          
          // Be more graceful about "already redeemed" success cases
          if (tokens.accessToken === 'existing') {
            toast({
              title: 'Authentication Complete',
              description: 'Your Microsoft 365 account was already connected and verified.',
            });
          } else {
            toast({
              title: 'Authentication Successful',
              description: 'Successfully authenticated and saved Microsoft 365 credentials',
            });
          }
        } else {
          console.error('❌ Failed to save tokens:', saveResult.error);
          throw new Error(saveResult.error || 'Failed to save authentication tokens to database');
        }
      } else {
        throw new Error('No refresh token received from Microsoft authentication');
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
      
      // Special handling for "already redeemed" errors - check if we already have a working setup
      if (error.message?.includes('already redeemed')) {
        try {
          await checkOAuthStatus();
          if (hasValidOAuth) {
            console.log('Detected valid OAuth setup despite "already redeemed" error');
            toast({
              title: 'Authentication Note',
              description: 'Your Microsoft 365 connection appears to be working despite seeing an error. You can ignore this message.',
              duration: 5000,
            });
            setError(null);
            return;
          }
        } catch (checkError) {
          console.error('Error checking OAuth status:', checkError);
        }
      }
      
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

  // Set appropriate SMTP settings for Office 365 when selected
  useEffect(() => {
    if (emailProvider === 'office365') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort('587');
      // Ensure we're using OAuth2 for Office 365
      setAuthType('oauth2');
    }
  }, [emailProvider]);

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
              emailProvider={emailProvider}
              onEmailPasswordChange={setEmailPassword}
              onOauth2ClientIdChange={setOauth2ClientId}
              onOauth2ClientSecretChange={setOauth2ClientSecret}
              onInitiateOAuth2={handleInitiateOAuth}
              onAuthTypeChange={setAuthType}
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
          onSave={async () => { await handleSaveSettings(); }}
        />
      </CardFooter>
      
      <OAuth2Handler onAuthCallback={handleAuthCallback} />
    </Card>
  );
};

export default EmailSettingsContainer;
