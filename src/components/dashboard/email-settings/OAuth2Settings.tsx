
import { useToast } from '@/hooks/use-toast';
import { initiateO365Auth } from '@/services/o365AuthService';

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

  return { handleInitiateOAuth };
};
