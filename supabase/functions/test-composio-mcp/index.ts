import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestMCPRequest {
  testType: 'connection' | 'email';
  recipientEmail?: string;
  subject?: string;
  body?: string;
  userId?: string; // Supabase auth user ID
}

interface MCPMessage {
  jsonrpc: string;
  id: number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

interface MCPClientCapabilities {
  roots?: { listChanged?: boolean };
  sampling?: {};
}

// MCP Protocol Implementation
class MCPClient {
  private messageId = 1;
  
  async getExistingMCPServer(apiKey: string): Promise<{ id: string; url: string; connectedAccountIds: string[] }> {
    try {
      console.log('🔍 Looking for existing MCP server with auth config...');
      
      // List existing MCP servers using the correct endpoint and headers
      const listResponse = await fetch('https://backend.composio.dev/api/v1/mcp/servers', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!listResponse.ok) {
        throw new Error(`Failed to list MCP servers: ${listResponse.status}`);
      }

      const existingServers = await listResponse.json();
      console.log('📋 Existing MCP servers:', JSON.stringify(existingServers, null, 2));

      // Look for the specific server with our target auth config
      const targetAuthConfig = 'ac_pfIe0Qy6LJq7';
      const existingServer = existingServers.find((server: any) => 
        server.authConfigs && server.authConfigs.includes(targetAuthConfig)
      );

      if (existingServer) {
        console.log('✅ Found existing MCP server:', existingServer.id, 'Name:', existingServer.name);
        
        // Check connected accounts
        const connectedAccountIds = existingServer.connectedAccountIds || [];
        if (connectedAccountIds.length === 0) {
          console.log('⚠️ No connected accounts found. Email accounts need to be connected to send emails.');
        } else {
          console.log(`✅ Found ${connectedAccountIds.length} connected account(s): ${connectedAccountIds.join(', ')}`);
        }
        
        // Use the existing URL format from the server
        const mcpUrl = existingServer.url || `https://apollo.composio.dev/v3/mcp/${existingServer.id}?transport=sse`;
        return { 
          id: existingServer.id, 
          url: mcpUrl,
          connectedAccountIds 
        };
      }

      // If no existing server found, throw an error
      throw new Error(`No MCP server found with auth config ${targetAuthConfig}. Please ensure the mcp-config-bqrn5q server exists with proper configuration.`);

    } catch (error) {
      console.error('❌ Error in getExistingMCPServer:', error);
      throw error;
    }
  }
  
  async getUserMCPServer(apiKey: string, userId: string): Promise<{ id: string; url: string; connectedAccountIds: string[] }> {
    try {
      console.log('🔍 Looking for user-specific MCP server...');
      
      // List existing MCP servers using the correct endpoint and headers
      const listResponse = await fetch(`https://backend.composio.dev/api/v1/mcp/servers/user/${userId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!listResponse.ok) {
        throw new Error(`Failed to list MCP servers: ${listResponse.status}`);
      }

      const existingServers = await listResponse.json();
      console.log('📋 Existing MCP servers:', JSON.stringify(existingServers, null, 2));

      // Look for the specific server with our target auth config
      const existingServer = existingServers.find((server: any) => 
        server.userId === userId
      );

      if (existingServer) {
        console.log('✅ Found existing MCP server:', existingServer.id, 'Name:', existingServer.name);
        
        // Check connected accounts
        const connectedAccountIds = existingServer.connectedAccountIds || [];
        if (connectedAccountIds.length === 0) {
          console.log('⚠️ No connected accounts found. Email accounts need to be connected to send emails.');
        } else {
          console.log(`✅ Found ${connectedAccountIds.length} connected account(s): ${connectedAccountIds.join(', ')}`);
        }
        
        // Use the existing URL format from the server
        const mcpUrl = existingServer.url || `https://apollo.composio.dev/v3/mcp/${existingServer.id}?transport=sse`;
        return { 
          id: existingServer.id, 
          url: mcpUrl,
          connectedAccountIds 
        };
      }

      // If no existing server found, throw an error
      throw new Error(`No MCP server found for user ${userId}. Please ensure the user has a valid MCP server configuration.`);

    } catch (error) {
      console.error('❌ Error in getUserMCPServer:', error);
      throw error;
    }
  }
  
  async connectToMCPServer(mcpUrl: string): Promise<WebSocket> {
    console.log('🔌 Connecting to MCP server URL:', mcpUrl);
    
    // Convert HTTP URL to WebSocket URL if needed
    const wsUrl = mcpUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    
    const ws = new WebSocket(wsUrl);
    
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log('✅ Connected to MCP server');
        resolve(ws);
      };
      
      ws.onerror = (error) => {
        console.error('❌ MCP connection error:', error);
        reject(error);
      };
      
      setTimeout(() => {
        reject(new Error('MCP connection timeout'));
      }, 10000);
    });
  }
  
  async initializeMCP(ws: WebSocket, userId?: string): Promise<void> {
    console.log('🤝 Initializing MCP session...');
    
    const initMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        clientInfo: {
          name: 'ScoutOut-Composio-Client',
          version: '1.0.0'
        },
        // Include user context if provided
        ...(userId && { 
          meta: { 
            userId: userId,
            context: 'ScoutOut Application'
          }
        })
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP initialization timeout'));
      }, 5000);
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('📥 MCP init response:', response);
          
          if (response.id === initMessage.id) {
            clearTimeout(timeout);
            if (response.error) {
              reject(new Error(`MCP initialization failed: ${response.error.message}`));
            } else {
              console.log('✅ MCP initialized successfully');
              resolve();
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      ws.send(JSON.stringify(initMessage));
    });
  }
  
  async listTools(ws: WebSocket): Promise<any[]> {
    console.log('📋 Listing available MCP tools...');
    
    const listMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'tools/list'
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Tool listing timeout'));
      }, 5000);
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('📥 Tools list response:', response);
          
          if (response.id === listMessage.id) {
            clearTimeout(timeout);
            if (response.error) {
              reject(new Error(`Tool listing failed: ${response.error.message}`));
            } else {
              resolve(response.result?.tools || []);
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      ws.send(JSON.stringify(listMessage));
    });
  }
  
  async callTool(ws: WebSocket, toolName: string, args: any): Promise<any> {
    console.log(`🔧 Calling MCP tool: ${toolName}`, args);
    
    const callMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Tool call timeout'));
      }, 30000); // Longer timeout for email sending
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('📥 Tool call response:', response);
          
          if (response.id === callMessage.id) {
            clearTimeout(timeout);
            if (response.error) {
              reject(new Error(`Tool call failed: ${response.error.message}`));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      ws.send(JSON.stringify(callMessage));
    });
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let ws: WebSocket | null = null;
  
  try {
    const composioApiKey = Deno.env.get('COMPOSIO_API_KEY');
    if (!composioApiKey) {
      throw new Error('Composio API key not configured');
    }

    const { testType, recipientEmail, subject, body, userId }: TestMCPRequest = await req.json();
    
    console.log(`🧪 Starting Composio MCP test: ${testType}`);
    
    const mcpClient = new MCPClient();
    
    // Test 1: MCP Server Connection Test
    if (testType === 'connection') {
      if (!userId) {
        throw new Error('Connection test requires userId');
      }
      
      console.log('📡 Testing MCP server connection...');
      
      const serverInfo = await mcpClient.getUserMCPServer(composioApiKey, userId);
      
      return new Response(JSON.stringify({
        success: true,
        testType: 'connection',
        data: {
          serverId: serverInfo.id,
          mcpUrl: serverInfo.url,
          userId: userId,
          connectedAccountIds: serverInfo.connectedAccountIds,
          connectedAccountsCount: serverInfo.connectedAccountIds.length,
          message: serverInfo.connectedAccountIds.length > 0 
            ? `MCP server connection successful with ${serverInfo.connectedAccountIds.length} connected account(s)`
            : 'MCP server connection successful, but no email accounts are connected',
          warning: serverInfo.connectedAccountIds.length === 0 
            ? 'You need to connect an Outlook account to send emails through MCP'
            : null
        },
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test 2: Email Sending via MCP Protocol
    if (testType === 'email') {
      if (!recipientEmail || !subject || !body || !userId) {
        throw new Error('Email test requires recipientEmail, subject, body, and userId');
      }

      console.log('📧 Testing email sending via MCP protocol...');
      
      // Get user-specific MCP server
      const serverInfo = await mcpClient.getUserMCPServer(composioApiKey, userId);
      
      // Check if accounts are connected
      if (serverInfo.connectedAccountIds.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          testType: 'email',
          error: 'No connected accounts found',
          data: {
            serverId: serverInfo.id,
            mcpUrl: serverInfo.url,
            connectedAccountIds: serverInfo.connectedAccountIds,
            message: `No email accounts are connected to the MCP server. Please connect an Outlook account first.`,
            troubleshooting: {
              step1: 'Go to Settings -> Email Integration',
              step2: 'Click \"Connect Office 365\" and follow the prompts',
              step3: 'Ensure the account has proper permissions'
            }
          },
          timestamp: new Date().toISOString()
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`✅ Proceeding with email test using ${serverInfo.connectedAccountIds.length} connected account(s)`);
      
      // Connect to the MCP server
      ws = await mcpClient.connectToMCPServer(serverInfo.url);
      
      // Initialize MCP session with user context
      await mcpClient.initializeMCP(ws, userId);
      
      // List available tools
      const tools = await mcpClient.listTools(ws);
      console.log('📋 Available MCP tools:', tools);
      
      // Find Outlook email tool
      const emailTool = tools.find(tool => 
        tool.name && (
          tool.name.toLowerCase().includes('outlook') && tool.name.toLowerCase().includes('send') ||
          tool.name.toLowerCase().includes('email')
        )
      );
      
      if (!emailTool) {
        throw new Error(`No Outlook email tool found. Available tools: ${tools.map(t => t.name).join(', ')}`);
      }
      
      console.log('📧 Using email tool:', emailTool.name);
      
      // Call the email tool
      const toolArgs = {
        to: recipientEmail,
        subject: subject,
        body: body
      };
      
      const emailResult = await mcpClient.callTool(ws, emailTool.name, toolArgs);
      
      ws.close();
      
      return new Response(JSON.stringify({
        success: true,
        testType: 'email',
        data: {
          serverId: serverInfo.id,
          mcpUrl: serverInfo.url,
          userId: userId,
          connectedAccountIds: serverInfo.connectedAccountIds,
          toolUsed: emailTool.name,
          toolArgs: toolArgs,
          result: emailResult,
          availableTools: tools.map(t => ({ name: t.name, description: t.description }))
        },
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid test type');

  } catch (error: any) {
    console.error('❌ Composio MCP test failed:', error);
    
    // Clean up WebSocket connection
    if (ws) {
      try {
        ws.close();
      } catch (closeError) {
        console.error('Error closing WebSocket:', closeError);
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);