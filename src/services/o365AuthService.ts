
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

  window.location.href = authUrl;
}

export async function handleO365AuthCallback(
  code: string, 
  clientId: string, 
  clientSecret: string, 
  redirectUri: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('o365-auth', {
      body: JSON.stringify({
        code,
        clientId,
        clientSecret,
        redirectUri,
      }),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error handling O365 auth callback:', error);
    throw error;
  }
}
