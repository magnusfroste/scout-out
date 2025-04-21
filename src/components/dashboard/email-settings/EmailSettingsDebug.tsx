
import { InfoIcon } from 'lucide-react';

interface EmailSettingsDebugProps {
  debugInfo: string | null;
}

export const EmailSettingsDebug = ({ debugInfo }: EmailSettingsDebugProps) => {
  if (!debugInfo) return null;

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <div className="flex items-center text-muted-foreground mb-2">
        <InfoIcon className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Debug Information</span>
      </div>
      <pre className="text-xs overflow-auto max-h-32">{debugInfo}</pre>
    </div>
  );
};
