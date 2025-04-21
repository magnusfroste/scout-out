
import { supabase } from '@/integrations/supabase/client';

export async function initiateO365Auth(clientId: string, redirectUri: string) {
  const MICROSOFT_OAUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";
  const scope = encodeURIComponent("https://outlook.office.com/SMTP.Send offline_access");
  
  const authUrl = `${MICROSOFT_OAUTH_URL}/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_mode=query`;

  // Save the current state before redirecting
  sessionStorage.setItem('emailSettings_redirecting', 'true');

  // Redirect to Microsoft OAuth login
  window.location.href = authUrl;
}

export async function handleO365AuthCallback(
  code: string, 
  clientId: string, 
  clientSecret: string, 
  redirectUri: string
) {
  try {
    console.log('Exchanging code for tokens...');
    
    const { data, error } = await supabase.functions.invoke('o365-auth', {
      body: JSON.stringify({
        code,
        clientId,
        clientSecret,
        redirectUri,
      }),
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }
    
    console.log('Token exchange successful:', data);
    return data;
  } catch (error) {
    console.error('Error handling O365 auth callback:', error);
    throw error;
  }
}
