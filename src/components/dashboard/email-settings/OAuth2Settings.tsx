import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Key, Loader2 } from 'lucide-react';
import { initiateO365Auth } from '@/services/oauth/oauthFlowService';
import { getGraphApiRequirements } from '@/services/o365AuthService';
import { O365SetupGuide } from './O365SetupGuide';

interface OAuth2SettingsProps {
  oauth2ClientId: string;
  emailAddress: string;
  validateForm: () => boolean;
}

export const OAuth2Settings = ({ 
  oauth2ClientId, 
  emailAddress,
  validateForm 
}: OAuth2SettingsProps) => {
  const requirements = getGraphApiRequirements();
  
  const handleInitiateOAuth = () => {
    // Start the authentication process
    try {
      if (!validateForm()) {
        return;
      }
      
      if (!oauth2ClientId) {
        throw new Error('Client ID is required');
      }
      
      // Store the email address in session storage
      // to be retrieved after OAuth callback
      sessionStorage.setItem('emailSettings_userEmail', emailAddress);
      
      const redirectUri = `${window.location.origin}/settings`;
      
      // Initiate the OAuth flow
      initiateO365Auth(oauth2ClientId, redirectUri);
    } catch (error: any) {
      console.error('Error initiating OAuth:', error);
      // Error will be handled by the parent component or global error handling
      throw error;
    }
  };
  
  const renderAuthUi = (
    hasStoredCredentials: boolean,
    existingSettings: any,
    needsAuthentication: boolean,
    oauthColumnsExist: boolean,
    oauth2ClientSecret: string,
    isAuthenticating: boolean,
    onOauth2ClientIdChange: (value: string) => void,
    onOauth2ClientSecretChange: (value: string) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oauth2ClientId">Microsoft Application (Client) ID</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="oauth2ClientId"
              placeholder="Azure application client ID"
              value={oauth2ClientId}
              onChange={(e) => onOauth2ClientIdChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="oauth2ClientSecret">Microsoft Client Secret</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="oauth2ClientSecret"
              type="password"
              placeholder={hasStoredCredentials ? "Use existing client secret" : "Azure application client secret"}
              value={oauth2ClientSecret}
              onChange={(e) => onOauth2ClientSecretChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasStoredCredentials && (
            <p className="text-sm text-muted-foreground">
              A client secret is already stored. Leave blank to keep using it.
            </p>
          )}
        </div>
        
        {needsAuthentication && (
          <Alert className="bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your account needs to be connected to Microsoft 365 before sending emails. 
              Please click the "Connect to Microsoft 365" button below.
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleInitiateOAuth}
          className="bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 mb-2"
          disabled={isAuthenticating || !oauth2ClientId || !oauthColumnsExist}
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect to Microsoft 365'
          )}
        </Button>
        <p className="text-xs mb-4 text-muted-foreground">
          You will be redirected to Microsoft to authenticate your account.
        </p>
        
        <div className="mt-6">
          <O365SetupGuide />
        </div>
      </div>
    );
  };

  return {
    handleInitiateOAuth,
    renderAuthUi
  };
};
