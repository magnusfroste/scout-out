
import { supabase } from '@/integrations/supabase/client';
import type { EmailAuthSettings } from '@/types/oauth';

export const saveOAuth2Tokens = async (
  userId: string, 
  refreshToken: string, 
  clientId: string, 
  clientSecret: string,
  emailAddress: string
): Promise<{ success: boolean; error?: string; details?: any }> => {
  console.log('🔐 Starting OAuth2 token save process...');
  console.log('Target user ID:', userId);
  
  try {
    // Verify current authentication state
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication error during token save:', authError);
      return { 
        success: false, 
        error: 'Authentication failed during token save', 
        details: authError 
      };
    }
    
    if (!currentUser) {
      console.error('❌ No authenticated user found during token save');
      return { 
        success: false, 
        error: 'User not authenticated during token save' 
      };
    }
    
    if (currentUser.id !== userId) {
      console.error('❌ User ID mismatch:', { currentUser: currentUser.id, targetUser: userId });
      return { 
        success: false, 
        error: 'User authentication mismatch during token save' 
      };
    }
    
    console.log('✅ User authentication verified for token save');
    
    // Fetch existing settings with detailed logging
    console.log('🔍 Checking for existing email settings...');
    const { data: existingSettings, error: fetchError } = await supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching existing settings:', fetchError);
      return { 
        success: false, 
        error: 'Failed to check existing settings', 
        details: fetchError 
      };
    }
    
    const operationType = existingSettings ? 'UPDATE' : 'INSERT';
    console.log(`📝 Will perform ${operationType} operation`);
    
    const settingsData = {
      oauth2_refresh_token: refreshToken,
      oauth2_client_id: clientId,
      oauth2_client_secret: clientSecret,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingSettings) {
      console.log('🔄 Updating existing settings with ID:', existingSettings.id);
      result = await supabase
        .from('user_email_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .eq('user_id', userId);
    } else {
      console.log('➕ Creating new settings record');
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
      console.error('❌ Database operation failed:', result.error);
      
      // Check for specific RLS errors
      if (result.error.message?.includes('row-level security')) {
        return { 
          success: false, 
          error: 'Permission denied - Row Level Security policy violation', 
          details: result.error 
        };
      }
      
      return { 
        success: false, 
        error: 'Database save operation failed', 
        details: result.error 
      };
    }
    
    console.log('✅ OAuth2 tokens saved successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Exception during OAuth2 token save:', error);
    return { 
      success: false, 
      error: 'Unexpected error during token save', 
      details: error 
    };
  }
};
