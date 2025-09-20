import { supabase } from "@/integrations/supabase/client";

/**
 * Initiate Composio OAuth flow for Office365/Outlook
 */
export const initiateComposioOAuth = async (emailAddress: string): Promise<void> => {
  console.log('Starting Composio MCP OAuth flow for:', emailAddress);
  
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
    
    // Get the connection URL from our new, robust edge function
    const { data, error } = await supabase.functions.invoke('get-or-create-mcp-connection', {
      body: {
        userId: user.id,
        emailAddress,
        redirectUrl,
      },
    });

    if (error || !data?.success) {
      console.error('Failed to get MCP connection URL:', error, data?.error);
      throw new Error(data?.error || 'Failed to get MCP connection URL.');
    }

    if (data.redirectUrl) {
      console.log('🔐 Redirecting to Composio OAuth URL...');
      window.location.href = data.redirectUrl;
    } else {
      throw new Error('No redirect URL returned from connection function.');
    }
    
  } catch (error) {
    console.error('Error starting Composio MCP OAuth flow:', error);
    throw error;
  }
};

/**
 * Handle Composio OAuth callback and verify connection
 */
interface ComposioCallbackData {
  emailAddress: string;
  connectionType: 'composio';
  message: string;
}

export const handleComposioOAuthCallback = async (): Promise<{ success: boolean; data?: ComposioCallbackData; error?: string }> => {
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
      
      // Update the connection status in our database (the table might exist or not)
      try {
        const { error: updateError } = await supabase
          .from('oauth_connections')
          .update({ 
            status: 'connected',
            connected_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('email_address', emailAddress)
          .eq('connection_type', 'composio');
          
        if (updateError) {
          console.error('Failed to update connection status:', updateError);
          // Don't fail the whole process for this
        }
      } catch (oauthError) {
        console.warn('oauth_connections table not available, skipping connection tracking');
      }
      
      // Create or update email settings record
      const { data: existingSettings } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('email_address', emailAddress)
        .single();
        
      if (existingSettings) {
        // Update existing record
        await supabase
          .from('user_email_settings')
          .update({
            auth_type: 'oauth2',
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
            smtp_port: 587, // Use number instead of string
            auth_type: 'oauth2',
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
    
    // Try to check oauth_connections table first
    try {
      let query = supabase
        .from('oauth_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('connection_type', 'composio')
        .eq('status', 'connected');
        
      if (emailAddress) {
        query = query.eq('email_address', emailAddress);
      }
      
      const { data: connections } = await query;
      
      if (connections && connections.length > 0) {
        return {
          connected: true,
          mcpServerId: connections[0]?.mcp_server_id
        };
      }
    } catch (error) {
      console.warn('oauth_connections table not available, checking user_email_settings');
    }
    
    // Fallback to checking user_email_settings
    let fallbackQuery = supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('connection_type', 'composio');
      
    if (emailAddress) {
      fallbackQuery = fallbackQuery.eq('email_address', emailAddress);
    }
    
    const { data: emailSettings } = await fallbackQuery;
    
    return {
      connected: emailSettings && emailSettings.length > 0,
      mcpServerId: undefined // Not available in email settings table
    };
  } catch (error) {
    console.error('Error checking Composio connection:', error);
    return { connected: false };
  }
};

/**
 * Handle Composio OAuth error
 */
export const handleComposioOAuthError = (error: unknown): string => {
  console.error('Composio OAuth error:', error);

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    if ('error_description' in error && typeof (error as { error_description: unknown }).error_description === 'string') {
      return (error as { error_description: string }).error_description;
    }
  }

  return 'Composio authentication failed. Please try again.';
};