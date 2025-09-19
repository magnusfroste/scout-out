
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
  console.log('🔄 Starting OAuth callback handling...');
  console.log('📝 Authorization code length:', code?.length || 0);
  console.log('🔑 Client ID:', clientId?.substring(0, 8) + '...');
  console.log('🔗 Redirect URI:', redirectUri);
  
  try {
    console.log('📞 Calling o365-auth edge function...');
    const { data, error } = await supabase.functions.invoke('o365-auth', {
      body: JSON.stringify({
        code,
        clientId,
        clientSecret,
        redirectUri
      })
    });
    
    if (error) {
      console.error('❌ Error from o365-auth edge function:', error);
      handleOAuthError(error);
    }
    
    console.log('📨 Response from edge function:', { 
      hasData: !!data, 
      hasRefreshToken: !!data?.refresh_token,
      hasAccessToken: !!data?.access_token 
    });
    
    if (!data || !data.refresh_token) {
      console.error('❌ No refresh_token received from token exchange:', data);
      
      // Special case: If we get an "already redeemed" error but a successful email setup previously
      if (data?.error && data.error.includes('already redeemed')) {
        // We'll check if the user already has valid tokens
        const { data: settings } = await supabase
          .from('user_email_settings')
          .select('oauth2_refresh_token')
          .eq('is_active', true)
          .maybeSingle();
          
        if (settings?.oauth2_refresh_token) {
          console.log('Found existing refresh token despite "already redeemed" error');
          return {
            accessToken: 'existing',
            refreshToken: settings.oauth2_refresh_token,
            expiresIn: 3600, // Default value
          };
        }
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      throw new Error('Failed to get refresh token');
    }
    
    console.log('✅ Successfully exchanged tokens');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    console.error('❌ Error in handleO365AuthCallback:', error);
    
    // If the error is about the code being already redeemed, let's check if we have a valid setup
    if (error.message?.includes('already redeemed')) {
      try {
        const { data: settings } = await supabase
          .from('user_email_settings')
          .select('oauth2_refresh_token')
          .eq('is_active', true)
          .maybeSingle();
          
        if (settings?.oauth2_refresh_token) {
          console.log('Found existing refresh token despite "already redeemed" error');
          return {
            accessToken: 'existing',
            refreshToken: settings.oauth2_refresh_token,
            expiresIn: 3600, // Default value
          };
        }
      } catch (checkError) {
        console.error('Error checking for existing settings:', checkError);
      }
    }
    
    throw new Error(error.message || 'Failed to complete authentication process');
  }
};

const handleOAuthError = (error: any) => {
  if (error.message?.includes('invalid_client')) {
    throw new Error('Invalid client ID or secret. Please check your Azure app credentials.');
  } else if (error.message?.includes('invalid_grant')) {
    // Check if it's the "already redeemed" error
    if (error.message?.includes('already redeemed')) {
      throw new Error('Authorization code was already redeemed. If this is your first login attempt, your authentication may still have succeeded.');
    } else {
      throw new Error('Authorization grant expired or already used. Please try authenticating again.');
    }
  } else if (error.message?.includes('SMTP')) {
    throw new Error('Your Microsoft account is missing SMTP.Send permission. Please update app permissions in Azure Portal.');
  }
  throw new Error(`Edge function error: ${error.message}`);
};
