
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
  const scope = encodeURIComponent('https://outlook.office.com/SMTP.Send offline_access');
  
  const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=query`;
  
  console.log('Redirecting to Microsoft auth page:', authUrl);
  
  // Redirect to Microsoft auth page
  window.location.href = authUrl;
};

export const handleO365AuthCallback = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  // Call token endpoint to exchange code for tokens
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');

  try {
    console.log('Exchanging auth code for tokens...');
    console.log('Using client ID:', clientId);
    console.log('Using redirect URI:', redirectUri);
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    // Log the full response for debugging
    console.log('Token response status:', response.status);
    const responseText = await response.text();
    console.log('Token response body:', responseText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: 'Could not parse error response' };
      }
      console.error('Token exchange failed:', errorData);
      console.error('Status:', response.status);
      throw new Error(errorData.error_description || 'Failed to get token');
    }
    
    const data = JSON.parse(responseText);
    console.log('Received tokens successfully');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
    
  } catch (error: any) {
    console.error('Error exchanging code for token:', error);
    throw new Error(error.message || 'Failed to get token');
  }
};
