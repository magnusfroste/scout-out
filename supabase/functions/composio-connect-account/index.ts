import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectAccountRequest {
  redirectUrl: string;
  emailAddress: string;
}

interface AuthConfig {
  id: string;
  name: string;
  appType: string;
  authMode: string;
  status: string;
}

interface MCPServer {
  id: string;
  name: string;
  url: string;
  authConfigs: string[];
  connectedAccountIds: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { redirectUrl, emailAddress }: ConnectAccountRequest = await req.json();

    if (!redirectUrl || !emailAddress) {
      throw new Error('Missing redirectUrl or emailAddress');
    }

    const composioApiKey = Deno.env.get('COMPOSIO_API_KEY');
    if (!composioApiKey) {
      throw new Error('Composio API key not configured');
    }

    console.log('🔗 Starting Composio account connection for user:', user.id);
    console.log('📧 Email address:', emailAddress);
    console.log('🔄 Redirect URL:', redirectUrl);

    // Use proven working components from our testing
    const AUTH_CONFIG_ID = 'ac_pfIe0Qy6LJq7'; // Known working auth config
    const MCP_SERVER_ID = 'cb5c8cdf-1448-41d3-87d8-7e014fb0ef91'; // Known working MCP server
    
    console.log('✅ Using proven working auth config:', AUTH_CONFIG_ID);
    console.log('✅ Using proven working MCP server:', MCP_SERVER_ID);

    // Create simplified auth config and server objects for compatibility
    const outlookAuthConfig = { id: AUTH_CONFIG_ID };
    const mcpServer = { id: MCP_SERVER_ID };

    // Initiate OAuth connection using proven working components
    console.log('🚀 Initiating OAuth connection for auth config:', outlookAuthConfig.id);
    
    const connectResponse = await fetch(`https://backend.composio.dev/api/v1/auth/configs/${outlookAuthConfig.id}/connect`, {
      method: 'POST',
      headers: {
        'X-API-Key': composioApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        redirectUrl: redirectUrl,
        entityId: user.id, // Use user ID as entity ID for connection
        labels: {
          email: emailAddress,
          userId: user.id
        }
      })
    });

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      throw new Error(`Failed to initiate OAuth connection: ${errorText}`);
    }

    const { redirectUrl: oauthUrl } = await connectResponse.json();
    console.log('✅ Generated OAuth URL, redirecting user...');

    // Store connection info for callback handling
    const connectionInfo = {
      userId: user.id,
      emailAddress,
      authConfigId: outlookAuthConfig.id,
      mcpServerId: mcpServer.id,
      timestamp: new Date().toISOString()
    };

    // Store in Supabase for callback processing
    const { error: storeError } = await supabaseClient
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        email_address: emailAddress,
        auth_config_id: outlookAuthConfig.id,
        mcp_server_id: mcpServer.id,
        connection_type: 'composio',
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (storeError) {
      console.error('Failed to store connection info:', storeError);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify({
      success: true,
      redirectUrl: oauthUrl,
      connectionInfo: connectionInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in composio-connect-account function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});