
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const MigrationAlert = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Migration Required</AlertTitle>
      <AlertDescription>
        The OAuth2 columns have not been added to the database yet. 
        Please ensure you've run the SQL migration scripts for OAuth2 support.
      </AlertDescription>
    </Alert>
  );
};
