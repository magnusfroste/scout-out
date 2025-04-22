
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { initiateO365Auth, getGraphApiRequirements } from '@/services/o365AuthService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Loader2, 
  ExternalLink, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2,
  List
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OAuth2SettingsProps {
  oauth2ClientId: string;
  emailAddress: string;
  validateForm: () => boolean;
}

export const OAuth2Settings = ({
  oauth2ClientId,
  emailAddress,
  validateForm,
}: OAuth2SettingsProps) => {
  const { toast } = useToast();
  const graphRequirements = getGraphApiRequirements();

  const handleInitiateOAuth = () => {
    if (!oauth2ClientId || !validateForm()) {
      return;
    }

    try {
      sessionStorage.setItem('emailSettings_redirecting', 'true');
      sessionStorage.setItem('emailSettings_clientId', oauth2ClientId);
      sessionStorage.setItem('emailSettings_userEmail', emailAddress);
      
      const redirectUri = `${window.location.origin}/settings`;
      sessionStorage.setItem('emailSettings_redirectUri', redirectUri);
      
      console.log('Initiating OAuth2 with redirect URI:', redirectUri);
      initiateO365Auth(oauth2ClientId, redirectUri);
    } catch (error: any) {
      console.error('Error initiating OAuth2:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate authentication process",
        variant: "destructive",
      });
    }
  };

  return {
    handleInitiateOAuth,
    graphRequirements,
    renderAuthUi: (
      hasStoredCredentials: boolean,
      existingSettings: any,
      needsAuthentication: boolean,
      oauthColumnsExist: boolean,
      oauth2ClientSecret: string,
      isAuthenticating: boolean,
      onOauth2ClientIdChange: (value: string) => void,
      onOauth2ClientSecretChange: (value: string) => void
    ) => (
      <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        {!oauthColumnsExist && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Migration Required</AlertTitle>
            <AlertDescription>
              The OAuth2 columns have not been added to the database yet. 
              Please run the SQL migration script first.
            </AlertDescription>
          </Alert>
        )}
        
        <h3 className="font-medium flex items-center">
          Microsoft 365 OAuth2 Configuration 
          <a 
            href="https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline text-sm inline-flex items-center"
          >
            <span>Azure App Registration Guide</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </h3>

        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <List className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Required Microsoft Graph API Permissions</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The following permissions will be requested when users connect their Microsoft account:
              </p>
              {graphRequirements.requiredPermissions.map((permission, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="text-blue-600 mr-2">•</span>
                  {permission}
                  {permission === 'Mail.Send' && (
                    <span className="ml-2 text-gray-500 text-xs">(required for sending emails)</span>
                  )}
                  {permission === 'User.Read' && (
                    <span className="ml-2 text-gray-500 text-xs">(basic profile access)</span>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
        
        {hasStoredCredentials && (
          <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>OAuth2 Credentials Stored</AlertTitle>
            <AlertDescription>
              Your Office 365 client ID and secret are already stored. You can update them below or reconnect with the existing credentials.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Azure App Setup Instructions</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                {graphRequirements.setupSteps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="oauth2ClientId">Client ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Find this in your Azure portal under App Registrations → Your App → Overview → Application (client) ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="oauth2ClientId"
              placeholder={hasStoredCredentials && !oauth2ClientId ? "Using stored Client ID (change only if needed)" : "Enter your Microsoft Azure app Client ID"}
              value={oauth2ClientId}
              onChange={(e) => onOauth2ClientIdChange(e.target.value)}
              disabled={!oauthColumnsExist || isAuthenticating}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="oauth2ClientSecret">Client Secret</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Find this in your Azure portal under App Registrations → Your App → Certificates & secrets → Client secrets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="oauth2ClientSecret"
              type="password"
              placeholder={hasStoredCredentials && !oauth2ClientSecret ? "Using stored Client Secret (change only if needed)" : "Enter your Microsoft Azure app Client Secret"}
              value={oauth2ClientSecret}
              onChange={(e) => onOauth2ClientSecretChange(e.target.value)}
              disabled={!oauthColumnsExist || isAuthenticating}
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm font-medium mb-2">Required Redirect URIs:</p>
            <div className="space-y-1">
              {graphRequirements.redirectUris.map((uri, index) => (
                <p key={index} className="text-sm text-muted-foreground break-all">
                  • {uri}
                </p>
              ))}
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleInitiateOAuth}
            disabled={isAuthenticating || !oauthColumnsExist}
            className="w-full"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : needsAuthentication ? (
              <>
                <Key className="mr-2 h-4 w-4" />
                Connect to Microsoft 365
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconnect to Microsoft 365
              </>
            )}
          </Button>
        </div>
      </div>
    )
  };
};
