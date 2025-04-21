
import { supabase } from '@/integrations/supabase/client';

export const checkOAuthColumnsExist = async (): Promise<boolean> => {
  try {
    // Try to query the table with a filter on one of the OAuth columns
    const { error } = await supabase
      .from('user_email_settings')
      .select('id')
      .is('oauth2_client_id', null)
      .limit(1);
    
    // If the query runs without error, the column exists
    if (!error) {
      return true;
    }
    
    // Check if the error message indicates missing column
    return !(error.message.includes('column') && error.message.includes('does not exist'));
  } catch (error) {
    console.error('Error checking OAuth columns:', error);
    return false;
  }
};

export const initiateO365Auth = async (clientId: string, redirectUri: string) => {
  // Store redirecting state and client ID in sessionStorage
  sessionStorage.setItem('emailSettings_redirecting', 'true');
  sessionStorage.setItem('emailSettings_clientId', clientId);
  sessionStorage.setItem('emailSettings_redirectUri', redirectUri);
  
  // Create Microsoft OAuth URL
  const authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  const responseType = 'code';
  // Important: include the SMTP.Send scope for email sending permission
  const scope = encodeURIComponent('https://outlook.office.com/SMTP.Send offline_access');
  
  const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=query`;
  
  console.log('Redirecting to Microsoft auth page:', authUrl);
  console.log('Client ID being used:', clientId);
  console.log('Redirect URI being used:', redirectUri);
  console.log('Scope being used:', scope);
  
  try {
    // Redirect to Microsoft auth page
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
  console.log('Using client ID:', clientId ? clientId.substring(0, 5) + '...' : 'missing');
  console.log('Using client secret:', clientSecret ? '[REDACTED]' : 'missing');
  console.log('Using redirect URI:', redirectUri);
  
  try {
    // We'll use the edge function to handle the token exchange
    console.log('Calling o365-auth edge function to exchange code for tokens');
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
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.refresh_token) {
      console.error('No refresh_token received from token exchange:', data);
      throw new Error('Failed to get refresh token');
    }
    
    console.log('Successfully received tokens from Microsoft');
    console.log('Access token length:', data.access_token?.length || 0);
    console.log('Refresh token length:', data.refresh_token?.length || 0);
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    console.error('Error in handleO365AuthCallback:', error);
    throw new Error(error.message || 'Failed to complete authentication');
  }
};

// Verify if a user has valid OAuth2 credentials
export const verifyO365Auth = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_email_settings')
      .select('oauth2_refresh_token')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('email_provider', 'office365')
      .single();
    
    if (error) {
      console.error('Error verifying OAuth2 credentials:', error);
      return false;
    }
    
    return !!data?.oauth2_refresh_token;
  } catch (error) {
    console.error('Exception verifying OAuth2 credentials:', error);
    return false;
  }
};
