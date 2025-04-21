
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OAuth2HandlerProps {
  onAuthCallback: () => Promise<void>;
}

export const OAuth2Handler = ({ onAuthCallback }: OAuth2HandlerProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const isRedirecting = sessionStorage.getItem('emailSettings_redirecting') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if ((code && isRedirecting) || code) {
      console.log('Authorization code detected in URL, handling callback');
      onAuthCallback().catch(error => {
        console.error('Error handling OAuth callback:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete the authentication process",
          variant: "destructive",
        });
      });
    } else {
      console.log('No authorization code in URL or not in redirecting state');
    }
  }, [onAuthCallback, toast]);

  return null;
};
