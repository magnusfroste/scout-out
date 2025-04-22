
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';
import { OAuth2Settings } from './OAuth2Settings';

interface AuthenticationFieldsProps {
  authType: 'password' | 'oauth2';
  emailPassword: string;
  existingSettings: any;
  oauth2ClientId: string;
  oauth2ClientSecret: string;
  oauthColumnsExist: boolean;
  isAuthenticating: boolean;
  emailProvider: string; // Added email provider prop
  onEmailPasswordChange: (value: string) => void;
  onOauth2ClientIdChange: (value: string) => void;
  onOauth2ClientSecretChange: (value: string) => void;
  onInitiateOAuth2: () => void;
  onAuthTypeChange: (value: 'password' | 'oauth2') => void; // Added auth type change handler
}

export const AuthenticationFields = ({
  authType,
  emailPassword,
  existingSettings,
  oauth2ClientId,
  oauth2ClientSecret,
  oauthColumnsExist,
  isAuthenticating,
  emailProvider,
  onEmailPasswordChange,
  onOauth2ClientIdChange,
  onOauth2ClientSecretChange,
  onInitiateOAuth2,
  onAuthTypeChange,
}: AuthenticationFieldsProps) => {
  
  // Set authType to oauth2 automatically when Office 365 is selected
  useEffect(() => {
    if (emailProvider === 'office365' && authType !== 'oauth2') {
      onAuthTypeChange('oauth2');
    }
  }, [emailProvider, authType, onAuthTypeChange]);
  
  const { renderAuthUi } = OAuth2Settings({
    oauth2ClientId,
    emailAddress: existingSettings?.email_address || '',
    validateForm: () => true,
  });

  // For Office 365, always show OAuth2 UI
  if (emailProvider === 'office365') {
    const hasStoredCredentials = existingSettings?.oauth2_client_id && existingSettings?.oauth2_client_secret;
    const needsAuthentication = !existingSettings?.oauth2_refresh_token;
    
    return renderAuthUi(
      hasStoredCredentials,
      existingSettings,
      needsAuthentication,
      oauthColumnsExist,
      oauth2ClientSecret,
      isAuthenticating,
      onOauth2ClientIdChange,
      onOauth2ClientSecretChange
    );
  }

  // For other providers, show password or OAuth based on authType
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
            onChange={(e) => onEmailPasswordChange(e.target.value)}
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
  }

  const hasStoredCredentials = existingSettings?.oauth2_client_id && existingSettings?.oauth2_client_secret;
  const needsAuthentication = !existingSettings?.oauth2_refresh_token;
  
  return renderAuthUi(
    hasStoredCredentials,
    existingSettings,
    needsAuthentication,
    oauthColumnsExist,
    oauth2ClientSecret,
    isAuthenticating,
    onOauth2ClientIdChange,
    onOauth2ClientSecretChange
  );
};
