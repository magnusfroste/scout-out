import { supabase } from "@/integrations/supabase/client";

/**
 * Initiate Composio OAuth flow for Office365/Outlook
 */
export const initiateComposioOAuth = async (emailAddress: string): Promise<void> => {
  console.log('Starting Composio OAuth flow for:', emailAddress);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Store the email address and flow type in session storage for later use
    const redirectUrl = `${window.location.origin}/simple-connect`;
    sessionStorage.setItem('composio_email_address', emailAddress);
    sessionStorage.setItem('composio_redirect_url', redirectUrl);
    sessionStorage.setItem('oauth_flow_type', 'composio');
    
    // Generate state parameter for security
    const state = crypto.randomUUID();
    sessionStorage.setItem('composio_state', state);
    
    // Call the Composio connect account edge function
    const { data, error } = await supabase.functions.invoke('composio-connect-account', {
      body: {
        redirectUrl,
        emailAddress,
      },
    });
    
    if (error || !data?.redirectUrl) {
      console.error('Failed to initiate Composio OAuth:', error);
      throw new Error(data?.error || 'Failed to initiate Composio OAuth connection');
    }
    
    console.log('Redirecting to Composio OAuth URL...');
    
    // Redirect to the Composio-generated OAuth URL
    window.location.href = data.redirectUrl;
  } catch (error) {
    console.error('Error starting Composio OAuth flow:', error);
    throw error;
  }
};

/**
 * Handle Composio OAuth callback and verify connection
 */
export const handleComposioOAuthCallback = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.log('Processing Composio OAuth callback...');
    
    // Get stored values from session storage
    const emailAddress = sessionStorage.getItem('composio_email_address');
    const storedState = sessionStorage.getItem('composio_state');
    
    if (!emailAddress) {
      throw new Error('Missing email address. Please try again from the settings page.');
    }
    
    // Check URL parameters for success/error indicators
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    
    // Verify state parameter if provided
    if (state && state !== storedState) {
      throw new Error('Invalid state parameter. Possible security issue.');
    }
    
    if (error) {
      throw new Error(`Composio OAuth error: ${error}`);
    }
    
    if (success === 'true') {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User session expired during callback');
      }
      
      console.log('✅ Composio OAuth connection successful');
      
      // Create or update email settings record
      const { data: existingSettings } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('email_address', emailAddress)
        .maybeSingle();
        
      if (existingSettings) {
        // Update existing record
        await supabase
          .from('user_email_settings')
          .update({
            connection_type: 'composio',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('email_address', emailAddress);
      } else {
        // Create new record
        await supabase
          .from('user_email_settings')
          .insert({
            user_id: user.id,
            email_address: emailAddress,
            email_provider: 'office365',
            smtp_host: 'smtp.office365.com',
            smtp_port: 587, // Use integer instead of string
            connection_type: 'composio',
            is_active: true
          });
      }
      
      return {
        success: true,
        data: {
          emailAddress,
          connectionType: 'composio',
          message: 'Successfully connected Office365 account via Composio'
        }
      };
    }
    
    // If we get here, the callback didn't indicate success or failure clearly
    throw new Error('Unclear OAuth callback result');
    
  } catch (error) {
    console.error('Error in Composio OAuth callback handler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during Composio OAuth callback'
    };
  }
};

/**
 * Check if user has a Composio connection
 */
export const checkComposioConnection = async (emailAddress?: string): Promise<{ connected: boolean; mcpServerId?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { connected: false };
    }
    
    // Check for Composio connection in user_email_settings
    let query = supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('connection_type', 'composio')
      .eq('is_active', true);
      
    if (emailAddress) {
      query = query.eq('email_address', emailAddress);
    }
    
    const { data: connections } = await query;
    
    return {
      connected: connections && connections.length > 0,
      mcpServerId: undefined // Will be available after types are updated
    };
  } catch (error) {
    console.error('Error checking Composio connection:', error);
    return { connected: false };
  }
};

/**
 * Handle Composio OAuth error
 */
export const handleComposioOAuthError = (error: any): string => {
  console.error('Composio OAuth error:', error);
  
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  
  return 'Composio authentication failed. Please try again.';
};