import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateMCPServerRequest {
  userId: string;
  emailAddress: string;
  redirectUrl: string;
}

serve(async (req: Request) => {
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
    const composioApiKey = Deno.env.get('COMPOSIO_API_KEY');
    if (!composioApiKey) {
      throw new Error('COMPOSIO_API_KEY not configured in environment');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { userId, emailAddress, redirectUrl }: CreateMCPServerRequest = await req.json();

    console.log('🚀 Creating user-specific MCP server for:', userId);

    // First, get or create auth config for Outlook
    const authConfigResponse = await fetch('https://backend.composio.dev/api/v1/apps/office365/auth-configs', {
      method: 'GET',
      headers: {
        'X-API-Key': composioApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!authConfigResponse.ok) {
      throw new Error('Failed to fetch auth configs');
    }

    const authConfigs = await authConfigResponse.json();
    let outlookAuthConfig = authConfigs.find((config: any) => 
      config.authMode === 'OAUTH2'
    );

    if (!outlookAuthConfig) {
      throw new Error('No Outlook OAuth2 auth config found. Please create one in Composio dashboard.');
    }

    console.log('✅ Found Outlook auth config:', outlookAuthConfig.id);

    // Create user-specific MCP server using Composio SDK pattern
    const mcpServerResponse = await fetch('https://backend.composio.dev/api/v1/mcp/servers', {
      method: 'POST',
      headers: {
        'X-API-Key': composioApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${userId}-outlook-server`,
        serverConfig: [{
          authConfigId: outlookAuthConfig.id,
          allowedTools: ["OUTLOOK_SEND_EMAIL", "OUTLOOK_FETCH_EMAILS"]
        }],
        options: {
          isChatAuth: true // Enable proper OAuth flow
        }
      })
    });

    if (!mcpServerResponse.ok) {
      const errorText = await mcpServerResponse.text();
      throw new Error(`Failed to create MCP server: ${errorText}`);
    }

    const mcpServer = await mcpServerResponse.json();
    console.log('✅ Created MCP server:', mcpServer.id);

    // Check user connection status
    const statusResponse = await fetch(`https://backend.composio.dev/api/v1/mcp/servers/${mcpServer.id}/users/${userId}/status`, {
      method: 'GET',
      headers: {
        'X-API-Key': composioApiKey,
        'Content-Type': 'application/json'
      }
    });

    let userConnected = false;
    let authUrl = null;

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      userConnected = status.connected;
      console.log('📊 User connection status:', userConnected);
    }

    // If user not connected, initiate OAuth flow
    if (!userConnected) {
      console.log('🔐 User not connected, initiating OAuth flow...');
      
      const connectResponse = await fetch(`https://backend.composio.dev/api/v1/auth/configs/${outlookAuthConfig.id}/connect`, {
        method: 'POST',
        headers: {
          'X-API-Key': composioApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirectUrl: redirectUrl,
          entityId: userId,
          labels: {
            email: emailAddress,
            userId: userId,
            mcpServerId: mcpServer.id
          }
        })
      });

      if (!connectResponse.ok) {
        const errorText = await connectResponse.text();
        throw new Error(`Failed to initiate OAuth: ${errorText}`);
      }

      const connectResult = await connectResponse.json();
      authUrl = connectResult.redirectUrl;
      console.log('✅ Generated OAuth URL');
    }

    // Store MCP server info in database
    const { error: storeError } = await supabaseClient
      .from('oauth_connections')
      .upsert({
        user_id: userId,
        email_address: emailAddress,
        auth_config_id: outlookAuthConfig.id,
        mcp_server_id: mcpServer.id,
        connection_type: 'composio',
        status: userConnected ? 'connected' : 'pending',
        created_at: new Date().toISOString()
      });

    if (storeError) {
      console.error('Failed to store MCP server info:', storeError);
    }

    return new Response(JSON.stringify({
      success: true,
      mcpServerId: mcpServer.id,
      authConfigId: outlookAuthConfig.id,
      userConnected,
      authUrl,
      message: userConnected 
        ? 'MCP server ready for use'
        : 'OAuth authentication required'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating MCP server:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
