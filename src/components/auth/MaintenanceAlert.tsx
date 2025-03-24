
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MaintenanceAlertProps {
  message: string;
}

const MaintenanceAlert: React.FC<MaintenanceAlertProps> = ({ message }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Maintenance in Progress</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default MaintenanceAlert;
