import { supabase } from '@/integrations/supabase/client';
import { 
  initiateO365Auth, 
  handleO365AuthCallback 
} from './oauth/oauthFlowService';
import { saveOAuth2Tokens } from './oauth/tokenService';
import { sendEmailViaGraphAPI } from './email/graphEmailService';

// Standard Microsoft OAuth Endpoints
export const MICROSOFT_OAUTH_ENDPOINTS = {
  AUTHORIZATION_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  TOKEN_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  REDIRECT_URL: `${window.location.origin}/settings`
};

export const checkOAuthColumnsExist = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_email_settings')
      .select('id')
      .is('oauth2_client_id', null)
      .limit(1);
    
    if (!error) {
      return true;
    }
    
    return !(error.message.includes('column') && error.message.includes('does not exist'));
  } catch (error) {
    console.error('Error checking OAuth columns:', error);
    return false;
  }
};

export const verifyO365Auth = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_email_settings')
      .select('oauth2_refresh_token, updated_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('email_provider', 'office365')
      .maybeSingle();
    
    if (error) {
      console.error('Error verifying OAuth2 credentials:', error);
      throw new Error('Failed to verify OAuth credentials. Please ensure you have registered your application in Azure AD.');
    }
    
    if (!data?.oauth2_refresh_token) {
      throw new Error('Missing OAuth2 refresh token. Please authenticate with Microsoft 365.');
    }
    
    return true;
  } catch (error) {
    console.error('Exception verifying OAuth2 credentials:', error);
    return false;
  }
};

export const getGraphApiRequirements = () => {
  return {
    requiredPermissions: [
      'Mail.Send',
      'User.Read'
    ],
    redirectUris: [
      `${window.location.origin}/settings`,
      `${window.location.origin}/auth/callback`
    ],
    microsoftOAuthUrls: {
      authorizationUrl: MICROSOFT_OAUTH_ENDPOINTS.AUTHORIZATION_URL,
      tokenUrl: MICROSOFT_OAUTH_ENDPOINTS.TOKEN_URL,
      redirectUrl: MICROSOFT_OAUTH_ENDPOINTS.REDIRECT_URL
    },
    setupSteps: [
      'Register a new application in Azure Active Directory',
      'Add the required permission "Mail.Send" under "API Permissions"',
      'Grant admin consent for your organization if required',
      'Create a client secret under "Certificates & secrets"',
      'Configure redirect URIs under "Authentication"',
      'Use the standard Microsoft OAuth endpoints provided'
    ]
  };
};

export { 
  initiateO365Auth, 
  handleO365AuthCallback, 
  saveOAuth2Tokens, 
  sendEmailViaGraphAPI 
};
