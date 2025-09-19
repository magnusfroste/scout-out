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
  
  async connectToComposiofMCP(apiKey: string): Promise<WebSocket> {
    console.log('🔌 Connecting to Composio MCP server...');
    
    // Connect to Composio's MCP WebSocket endpoint
    const ws = new WebSocket('wss://backend.composio.dev/api/v2/mcp', {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log('✅ Connected to Composio MCP');
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
  
  async initializeMCP(ws: WebSocket): Promise<void> {
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
          name: 'MBA-Composio-Client',
          version: '1.0.0'
        }
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

    const { testType, recipientEmail, subject, body }: TestMCPRequest = await req.json();
    
    console.log(`🧪 Starting Composio MCP test: ${testType}`);
    
    const mcpClient = new MCPClient();
    
    // Test 1: MCP Connection and Initialization
    if (testType === 'connection') {
      console.log('📡 Testing MCP connection and initialization...');
      
      ws = await mcpClient.connectToComposiofMCP(composioApiKey);
      await mcpClient.initializeMCP(ws);
      const tools = await mcpClient.listTools(ws);
      
      ws.close();
      
      return new Response(JSON.stringify({
        success: true,
        testType: 'connection',
        data: {
          connectionEstablished: true,
          protocolVersion: '2024-11-05',
          availableTools: tools,
          toolCount: tools.length
        },
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test 2: Email Sending via MCP
    if (testType === 'email') {
      if (!recipientEmail || !subject || !body) {
        throw new Error('Email test requires recipientEmail, subject, and body');
      }

      console.log('📧 Testing email sending via MCP protocol...');
      
      ws = await mcpClient.connectToComposiofMCP(composioApiKey);
      await mcpClient.initializeMCP(ws);
      const tools = await mcpClient.listTools(ws);
      
      // Find Outlook email tool
      const emailTool = tools.find(tool => 
        tool.name && tool.name.toLowerCase().includes('email') && 
        tool.name.toLowerCase().includes('outlook')
      );
      
      if (!emailTool) {
        throw new Error('No Outlook email tool found in available MCP tools');
      }
      
      console.log('📧 Using email tool:', emailTool.name);
      
      // Call the email tool with auth config
      const toolArgs = {
        to: recipientEmail,
        subject: subject,
        body: body,
        authConfig: {
          authConfigId: "ac_pfIe0Qy6LJq7"
        }
      };
      
      const emailResult = await mcpClient.callTool(ws, emailTool.name, toolArgs);
      
      ws.close();
      
      return new Response(JSON.stringify({
        success: true,
        testType: 'email',
        data: {
          toolUsed: emailTool.name,
          toolArgs: toolArgs,
          result: emailResult,
          availableTools: tools
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