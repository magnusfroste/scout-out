
import { supabase } from '@/integrations/supabase/client';
import { initiateO365Auth, handleO365AuthCallback } from './oauth/oauthFlowService';
import { saveOAuth2Tokens } from './oauth/tokenService';
import { sendEmailViaGraphAPI } from './email/graphEmailService';

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
      return false;
    }
    
    return !!(data?.oauth2_refresh_token);
  } catch (error) {
    console.error('Exception verifying OAuth2 credentials:', error);
    return false;
  }
};

export { 
  initiateO365Auth, 
  handleO365AuthCallback, 
  saveOAuth2Tokens, 
  sendEmailViaGraphAPI 
};
