import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionRequest {
  userId: string;
  emailAddress: string;
  redirectUrl?: string; // Make optional for testing steps
  step?: 'check_db' | 'get_auth_config' | 'create_mcp_server' | 'get_connect_url';
  // For specific steps, we might need existing IDs
  authConfigId?: string;
  mcpServerId?: string;
}

// Helper function to get existing Auth Config
async function getExistingAuthConfig(apiKey: string): Promise<string> {
  console.log('🔍 Fetching existing Office 365 Auth Config...');
  const response = await fetch('https://backend.composio.dev/api/v1/apps/office365/auth-configs', {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch auth configs: ${errorText}`);
  }
  const authConfigs = await response.json();
  const outlookAuthConfig = authConfigs.find((config: any) => 
    config.auth_scheme === 'oauth2' && config.app_name === 'office365'
  );
  if (!outlookAuthConfig) {
    throw new Error('No Outlook OAuth2 auth config found. Please create one in Composio dashboard.');
  }
  console.log('✅ Found existing Auth Config:', outlookAuthConfig.id);
  return outlookAuthConfig.id;
}

// Helper function to create an MCP Server
async function createMCPServer(apiKey: string, userId: string, authConfigId: string): Promise<string> {
  console.log('🔄 Creating new MCP Server for user:', userId);
  const response = await fetch('https://backend.composio.dev/api/v1/mcp/servers', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
      name: `${userId}-outlook-server`,
      serverConfig: [{ authConfigId, allowedTools: ['OUTLOOK_OUTLOOK_SEND_EMAIL'] }],
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create MCP server: ${errorText}`);
  }
  const result = await response.json();
  console.log('✅ Created MCP Server:', result.id);
  return result.id;
}

// Main server handler
// Gets the shared app-level auth config, using existing one if available.
async function getOrCreateAppAuthConfig(supabase: SupabaseClient, apiKey: string): Promise<string> {
  const { data: existing } = await supabase
    .from('app_integrations')
    .select('config')
    .eq('integration_name', 'composio_outlook')
    .single();

  if (existing && existing.config.auth_config_id) {
    console.log('✅ Found existing app-level Auth Config:', existing.config.auth_config_id);
    return existing.config.auth_config_id;
  }

  console.log('🔄 No app-level Auth Config found, fetching existing one...');
  const authConfigId = await getExistingAuthConfig(apiKey);

  const { error } = await supabase.from('app_integrations').upsert({
    integration_name: 'composio_outlook',
    config: { auth_config_id: authConfigId },
  });

  if (error) {
    console.error('Failed to save app-level auth config:', error);
    throw new Error('Failed to save app-level auth config.');
  }

  return authConfigId;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const composioApiKey = Deno.env.get('COMPOSIO_API_KEY')!;

        const { 
      userId, 
      emailAddress, 
      redirectUrl, 
      step, 
      authConfigId: inputAuthConfigId, 
      mcpServerId: inputMcpServerId 
    }: ConnectionRequest = await req.json();

    // Step-by-step execution for diagnostic tool
    if (step) {
      try {
        switch (step) {
          case 'check_db': {
            const { data: connection } = await supabaseClient.from('oauth_connections').select('*').eq('user_id', userId).eq('email_address', emailAddress).single();
            return new Response(JSON.stringify({ success: true, step: 'check_db', data: connection }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          case 'get_auth_config': {
            const authConfigId = await getExistingAuthConfig(composioApiKey);
            return new Response(JSON.stringify({ success: true, step: 'get_auth_config', data: { authConfigId } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          case 'create_mcp_server': {
            if (!inputAuthConfigId) throw new Error('authConfigId is required for create_mcp_server step');
            const mcpServerId = await createMCPServer(composioApiKey, userId, inputAuthConfigId);
            return new Response(JSON.stringify({ success: true, step: 'create_mcp_server', data: { mcpServerId } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          case 'get_connect_url': {
            if (!inputAuthConfigId) throw new Error('authConfigId is required for get_connect_url step');
            if (!redirectUrl) throw new Error('redirectUrl is required for get_connect_url step');
            const connectResponse = await fetch(`https://backend.composio.dev/api/v1/auth-configs/${inputAuthConfigId}/connect`, {
              method: 'POST',
              headers: { 'x-api-key': composioApiKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ redirect_uri: redirectUrl, entity: { id: userId } }),
            });
            if (!connectResponse.ok) {
              const errorText = await connectResponse.text();
              throw new Error(`Failed to get connection URL: ${errorText}`);
            }
            const { redirectUrl: finalAuthUrl } = await connectResponse.json();
            return new Response(JSON.stringify({ success: true, step: 'get_connect_url', data: { redirectUrl: finalAuthUrl } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      } catch (error) {
        return new Response(JSON.stringify({ success: false, step, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Full flow for main application logic
    if (!redirectUrl) {
      throw new Error('redirectUrl is required for the full connection flow');
    }

    // 1. Get the shared application-level Auth Config ID
    const authConfigId = await getOrCreateAppAuthConfig(supabaseClient, composioApiKey);

    // 2. Check if a per-user MCP server already exists
    const { data: userConnection } = await supabaseClient
      .from('oauth_connections')
      .select('mcp_server_id')
      .eq('user_id', userId)
      .single();

    let mcpServerId = userConnection?.mcp_server_id;

    // 3. Create a per-user MCP Server if it doesn't exist
    if (!mcpServerId) {
      mcpServerId = await createMCPServer(composioApiKey, userId, authConfigId);
    }

    // 4. Store/update the user's connection details
    const { error: upsertError } = await supabaseClient.from('oauth_connections').upsert({
      user_id: userId,
      email_address: emailAddress,
      connection_type: 'composio',
      auth_config_id: authConfigId, // Store reference to shared auth config
      mcp_server_id: mcpServerId,
      status: 'pending', // Always pending until callback confirms
    }, { onConflict: 'user_id,email_address,connection_type' });

    if (upsertError) throw upsertError;

    // 5. Get the final connection URL from Composio
    console.log('🔐 Getting connection URL from Composio...');
    const connectResponse = await fetch(`https://backend.composio.dev/api/v1/auth-configs/${authConfigId}/connect`, {
      method: 'POST',
      headers: { 'x-api-key': composioApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirect_uri: redirectUrl, entity: { id: userId } }),
    });

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      throw new Error(`Failed to get connection URL: ${errorText}`);
    }

    const { redirectUrl: finalAuthUrl } = await connectResponse.json();

    return new Response(JSON.stringify({ success: true, redirectUrl: finalAuthUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-or-create-mcp-connection:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
