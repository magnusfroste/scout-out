import { supabase } from "@/integrations/supabase/client";

// Microsoft OAuth endpoints for shared app
const MICROSOFT_OAUTH_ENDPOINTS = {
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  redirectUrl: `${window.location.origin}/simple-connect`,
};

const OUTLOOK_SCOPES = 'openid email profile offline_access https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read';

/**
 * Initiate OAuth 2.0 authorization flow using shared app credentials
 */
export const initiateO365AuthShared = async (): Promise<void> => {
  console.log('Starting shared O365 OAuth flow...');
  
  try {
    // Get the shared client ID from the server
    const { data, error } = await supabase.functions.invoke('get-shared-client-id');
    
    if (error || !data?.clientId) {
      console.error('Failed to get shared client ID:', error);
      throw new Error('Unable to get shared OAuth configuration');
    }
    
    // Store the redirect URL and flow type in session storage for later use
    sessionStorage.setItem('oauth_redirect_url', MICROSOFT_OAUTH_ENDPOINTS.redirectUrl);
    sessionStorage.setItem('oauth_flow_type', 'shared');
    
    // Generate state parameter for security
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    
    // Build authorization URL with the real shared client ID
    const authUrl = new URL(MICROSOFT_OAUTH_ENDPOINTS.authUrl);
    authUrl.searchParams.set('client_id', data.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', MICROSOFT_OAUTH_ENDPOINTS.redirectUrl);
    authUrl.searchParams.set('scope', OUTLOOK_SCOPES);
    authUrl.searchParams.set('response_mode', 'query');
    authUrl.searchParams.set('state', state);
    
    console.log('Redirecting to Microsoft for shared app authorization...');
    
    // Redirect to Microsoft authorization endpoint
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error('Error starting shared OAuth flow:', error);
    throw error;
  }
};

/**
 * Handle OAuth 2.0 authorization callback using shared app credentials
 */
export const handleO365AuthCallbackShared = async (
  code: string,
  redirectUri: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.log('Processing shared O365 OAuth callback...');
    
    // Call the shared OAuth edge function
    const { data, error } = await supabase.functions.invoke('o365-auth-shared', {
      body: {
        code,
        redirectUri,
      },
    });

    if (error) {
      console.error('Shared OAuth edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to exchange authorization code'
      };
    }

    if (!data?.access_token || !data?.refresh_token) {
      console.error('Invalid token response from shared OAuth function:', data);
      return {
        success: false,
        error: 'Invalid token response from server'
      };
    }

    console.log('Successfully obtained tokens via shared app');
    
    return {
      success: true,
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in || 3600,
      }
    };

  } catch (error) {
    console.error('Error in shared OAuth callback handler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Handle OAuth error for shared flow
 */
export const handleSharedOAuthError = (error: any): string => {
  console.error('Shared OAuth error:', error);
  
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  
  return 'Authentication failed. Please try again.';
};