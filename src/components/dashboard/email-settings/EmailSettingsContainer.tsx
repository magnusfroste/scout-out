import React from 'react';
import { Mail } from 'lucide-react';
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
import { Loader2 } from 'lucide-react';

const EmailSettingsContainer = () => {
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
  } = useEmailSettingsForm(existingSettings, hasValidOAuth, setHasValidOAuth, fetchEmailSettings);

  const { handleInitiateOAuth } = OAuth2Settings({
    oauth2ClientId,
    emailAddress,
    validateForm,
  });

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
