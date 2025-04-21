
import { supabase } from '@/integrations/supabase/client';

export const initiateO365Auth = async (clientId: string, redirectUri: string) => {
  sessionStorage.setItem('emailSettings_redirecting', 'true');
  sessionStorage.setItem('emailSettings_clientId', clientId);
  sessionStorage.setItem('emailSettings_redirectUri', redirectUri);
  
  const authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  const responseType = 'code';
  
  const scopes = [
    'openid',
    'offline_access',
    'Contacts.Read',
    'Contacts.ReadWrite', 
    'Calendars.Read',
    'Calendars.Read.Shared',
    'Calendars.ReadWrite',
    'Mail.ReadWrite',
    'Mail.ReadWrite.Shared',
    'Mail.Send',
    'Mail.Send.Shared',
    'MailboxSettings.Read',
  ];
  
  const scope = encodeURIComponent(scopes.join(' '));
  const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=query&prompt=consent`;
  
  console.log('Initiating OAuth2 with redirect URI:', redirectUri);
  
  try {
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error redirecting to Microsoft auth page:', error);
    throw new Error('Failed to redirect to Microsoft login page');
  }
};

export const handleO365AuthCallback = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  console.log('Starting OAuth callback handling with code:', code ? code.substring(0, 6) + '...' : 'no code');
  
  try {
    const { data, error } = await supabase.functions.invoke('o365-auth', {
      body: JSON.stringify({
        code,
        clientId,
        clientSecret,
        redirectUri
      })
    });
    
    if (error) {
      console.error('Error from o365-auth edge function:', error);
      handleOAuthError(error);
    }
    
    if (!data || !data.refresh_token) {
      console.error('No refresh_token received from token exchange:', data);
      if (data?.error) {
        throw new Error(data.error);
      }
      throw new Error('Failed to get refresh token');
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    console.error('Error in handleO365AuthCallback:', error);
    throw new Error(error.message || 'Failed to complete authentication process');
  }
};

const handleOAuthError = (error: any) => {
  if (error.message?.includes('invalid_client')) {
    throw new Error('Invalid client ID or secret. Please check your Azure app credentials.');
  } else if (error.message?.includes('invalid_grant')) {
    throw new Error('Authorization grant expired or already used. Please try authenticating again.');
  } else if (error.message?.includes('SMTP')) {
    throw new Error('Your Microsoft account is missing SMTP.Send permission. Please update app permissions in Azure Portal.');
  }
  throw new Error(`Edge function error: ${error.message}`);
};
