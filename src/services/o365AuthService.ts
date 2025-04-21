
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
  sessionStorage.setItem('emailSettings_clientId', clientId);
  sessionStorage.setItem('emailSettings_redirectUri', redirectUri);

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
    console.log('Parameters:', { code: !!code, clientId: !!clientId, clientSecret: !!clientSecret, redirectUri });
    
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

// Check if the OAuth migration has been applied
export async function checkOAuthColumnsExist() {
  try {
    // Try to query a user_email_settings record with a simple query
    // If the columns exist, this will succeed, otherwise it will fail
    const { error } = await supabase
      .from('user_email_settings')
      .select('oauth2_client_id')
      .limit(1);
    
    // If there's an error with a message about the column not existing, 
    // then the migration hasn't been applied
    if (error && error.message && error.message.includes("column")) {
      console.error('OAuth2 columns not found in database:', error);
      return false;
    }
    
    // No error means the columns exist
    return true;
  } catch (error) {
    console.error('Error checking OAuth columns:', error);
    return false;
  }
}
