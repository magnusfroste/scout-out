
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OAuth2HandlerProps {
  onAuthCallback: () => Promise<void>;
}

export const OAuth2Handler = ({ onAuthCallback }: OAuth2HandlerProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isHandling, setIsHandling] = useState<boolean>(false);

  useEffect(() => {
    const isRedirecting = sessionStorage.getItem('emailSettings_redirecting') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (errorParam) {
      console.error('OAuth error from Microsoft:', errorParam, errorDescription);
      setError(`Error from Microsoft: ${errorDescription || errorParam}`);
      sessionStorage.removeItem('emailSettings_redirecting');
      return;
    }
    
    if ((code && isRedirecting) || code) {
      setIsHandling(true);
      console.log('Authorization code detected in URL, handling callback');
      onAuthCallback()
        .then(() => {
          console.log('OAuth callback successfully handled');
          setIsHandling(false);
        })
        .catch(error => {
          console.error('Error handling OAuth callback:', error);
          setError(error.message || "Failed to complete the authentication process");
          setIsHandling(false);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to complete the authentication process",
            variant: "destructive",
          });
        });
    } else {
      console.log('No authorization code in URL or not in redirecting state');
    }
  }, [onAuthCallback, toast]);

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isHandling) {
    return (
      <Alert className="mt-4 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
        <AlertTitle>Processing Authentication</AlertTitle>
        <AlertDescription>Please wait while we complete the authentication process...</AlertDescription>
      </Alert>
    );
  }

  return null;
};
