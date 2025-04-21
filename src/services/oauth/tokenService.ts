
import { supabase } from '@/integrations/supabase/client';
import type { EmailAuthSettings } from '@/types/oauth';

export const saveOAuth2Tokens = async (
  userId: string, 
  refreshToken: string, 
  clientId: string, 
  clientSecret: string,
  emailAddress: string
): Promise<boolean> => {
  console.log('Saving OAuth2 tokens to database for user:', userId);
  
  try {
    const { data: existingSettings, error: fetchError } = await supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing settings:', fetchError);
      return false;
    }
    
    const settingsData = {
      oauth2_refresh_token: refreshToken,
      oauth2_client_id: clientId,
      oauth2_client_secret: clientSecret,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingSettings) {
      result = await supabase
        .from('user_email_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .eq('user_id', userId);
    } else {
      result = await supabase
        .from('user_email_settings')
        .insert({
          user_id: userId,
          email_address: emailAddress || 'office365@example.com',
          email_provider: 'office365',
          smtp_host: 'smtp.office365.com',
          smtp_port: 587,
          is_active: true,
          app_password: 'oauth2_not_used',
          ...settingsData
        });
    }
    
    if (result.error) {
      console.error('Error saving OAuth2 tokens:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving OAuth2 tokens:', error);
    return false;
  }
};
