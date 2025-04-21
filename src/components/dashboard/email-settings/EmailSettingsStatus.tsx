
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { EmailSettings } from '@/types/email';

interface EmailSettingsStatusProps {
  settings: EmailSettings;
  hasValidOAuth: boolean;
}

export const EmailSettingsStatus = ({ settings, hasValidOAuth }: EmailSettingsStatusProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-900">
      <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Email settings configured</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        You can now send emails directly from the app using {settings.email_address}
      </p>
      {settings.email_provider === 'office365' && (
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
  );
};
