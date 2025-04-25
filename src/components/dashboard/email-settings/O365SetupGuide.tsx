import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  CloudCog 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGraphApiRequirements } from '@/services/o365AuthService';

export const O365SetupGuide = () => {
  const requirements = getGraphApiRequirements();
  
  const openMicrosoftDocs = () => {
    window.open(
      "https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app", 
      "_blank"
    );
  };

  const openAzureAppRegistration = () => {
    window.open(
      "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade/quickStartType/AzureADQuickStart",
      "_blank"
    );
  };

  return (
    <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudCog className="h-6 w-6 text-blue-600" />
          Microsoft 365 App Setup Guide
        </CardTitle>
        <CardDescription>
          Connect your Microsoft 365 account in just 3 simple steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Step 1: Register App in Azure</h3>
            <p className="text-sm text-muted-foreground">
              Go to Azure Portal, click "App registrations" and select "New registration"
            </p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={openAzureAppRegistration}
              className="text-blue-600 hover:text-blue-800 p-0 mt-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Azure App Registration Portal
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Important:</strong> When registering, select:
              <br />
              "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) 
              and personal Microsoft accounts (e.g. Skype, Xbox)"
            </p>
            <div className="text-sm text-muted-foreground mt-2 bg-gray-50 p-2 rounded border border-gray-200">
              <strong>Redirect URI (optional):</strong>
              <p className="break-words">{requirements.redirectUris[0]}</p>
              <p className="text-xs mt-1">
                We'll return the authentication response to this URI after successful authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Step 2: Configure Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Select "Microsoft Graph" API permissions for email and profile access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <ExternalLink className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Step 3: Copy Client Credentials</h3>
            <p className="text-sm text-muted-foreground">
              Copy Client ID and generate a Client Secret for authentication
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Need more detailed instructions?
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openMicrosoftDocs}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Official Microsoft Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
