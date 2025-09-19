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

    // Step 1: Get or create Auth Config for Office365/Outlook
    console.log('🔍 Looking for existing Office365 Auth Config...');
    
    const authConfigsResponse = await fetch('https://backend.composio.dev/api/v1/auth/configs', {
      headers: {
        'X-API-Key': composioApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!authConfigsResponse.ok) {
      throw new Error(`Failed to fetch auth configs: ${authConfigsResponse.statusText}`);
    }

    const { items: authConfigs }: { items: AuthConfig[] } = await authConfigsResponse.json();
    console.log('📋 Found auth configs:', authConfigs.length);
    
    let outlookAuthConfig = authConfigs.find(config => 
      config.appType === 'OUTLOOK' && config.authMode === 'OAUTH2'
    );

    if (!outlookAuthConfig) {
      console.log('➕ Creating new Outlook Auth Config...');
      
      const createAuthConfigResponse = await fetch('https://backend.composio.dev/api/v1/auth/configs', {
        method: 'POST',
        headers: {
          'X-API-Key': composioApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appType: 'OUTLOOK',
          authMode: 'OAUTH2',
          name: `outlook-config-${Date.now()}`,
          config: {
            scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read openid email profile offline_access'
          }
        })
      });

      if (!createAuthConfigResponse.ok) {
        const errorText = await createAuthConfigResponse.text();
        throw new Error(`Failed to create auth config: ${errorText}`);
      }

      outlookAuthConfig = await createAuthConfigResponse.json();
      console.log('✅ Created Outlook Auth Config:', outlookAuthConfig.id);
    } else {
      console.log('✅ Using existing Outlook Auth Config:', outlookAuthConfig.id);
    }

    // Step 2: Get or ensure MCP server exists and is linked to the auth config
    console.log('🔍 Looking for existing MCP server...');
    
    const mcpServersResponse = await fetch('https://backend.composio.dev/api/v1/mcp/servers', {
      headers: {
        'X-API-Key': composioApiKey
      }
    });

    if (!mcpServersResponse.ok) {
      throw new Error(`Failed to fetch MCP servers: ${mcpServersResponse.statusText}`);
    }

    const { items: mcpServers }: { items: MCPServer[] } = await mcpServersResponse.json();
    console.log('📋 Found MCP servers:', mcpServers.length);
    
    let mcpServer = mcpServers.find(server => 
      server.authConfigs && server.authConfigs.includes(outlookAuthConfig.id)
    );

    if (!mcpServer) {
      // Check if there's any existing server and add our auth config to it
      if (mcpServers.length > 0) {
        mcpServer = mcpServers[0];
        console.log('🔗 Adding auth config to existing MCP server:', mcpServer.id);
        
        const updateServerResponse = await fetch(`https://backend.composio.dev/api/v1/mcp/servers/${mcpServer.id}`, {
          method: 'PATCH',
          headers: {
            'X-API-Key': composioApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            authConfigs: [...(mcpServer.authConfigs || []), outlookAuthConfig.id]
          })
        });

        if (!updateServerResponse.ok) {
          const errorText = await updateServerResponse.text();
          console.error('Failed to update MCP server:', errorText);
          // Continue anyway, might still work
        } else {
          console.log('✅ Updated MCP server with auth config');
          mcpServer.authConfigs = [...(mcpServer.authConfigs || []), outlookAuthConfig.id];
        }
      } else {
        console.log('➕ Creating new MCP server with auth config...');
        
        const createServerResponse = await fetch('https://backend.composio.dev/api/v1/mcp/servers', {
          method: 'POST',
          headers: {
            'X-API-Key': composioApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `mcp-server-${user.id}-${Date.now()}`,
            authConfigs: [outlookAuthConfig.id]
          })
        });

        if (!createServerResponse.ok) {
          const errorText = await createServerResponse.text();
          throw new Error(`Failed to create MCP server: ${errorText}`);
        }

        mcpServer = await createServerResponse.json();
        console.log('✅ Created MCP server:', mcpServer.id);
      }
    }

    // Step 3: Initiate OAuth connection
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