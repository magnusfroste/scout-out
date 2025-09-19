import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  testType: string;
  status?: number;
  data?: any;
  error?: string;
  timestamp: string;
  debugLog?: string[];
}

interface MCPServer {
  id: string;
  name: string;
  status: string;
  ws_url: string;
}

const ComposioMCPTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [emailResult, setEmailResult] = useState<TestResult | null>(null);
  
  // API Key
  const [apiKey, setApiKey] = useState('');
  
  // Email test form
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('MBA SaaS - Composio MCP Test');
  const [body, setBody] = useState('This is a test email sent through Composio MCP from MBA SaaS application.');

  // MCP Server state
  const [mcpServer, setMcpServer] = useState<MCPServer | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addToDebugLog = (message: string) => {
    console.log('[MCP Debug]:', message);
    setDebugLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Composio API key');
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);
    setDebugLog([]);
    
    try {
      addToDebugLog('Testing Composio API connection...');
      
      // Step 1: Create/Get MCP Server
      const response = await fetch('https://backend.composio.dev/api/v1/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          auth_config: 'ac_pfIe0Qy6LJq7'
        })
      });

      addToDebugLog(`MCP API Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const serverData = await response.json();
      addToDebugLog(`MCP Server Created: ${JSON.stringify(serverData)}`);
      
      setMcpServer(serverData);
      
      setConnectionResult({
        success: true,
        testType: 'connection',
        status: response.status,
        data: serverData,
        timestamp: new Date().toISOString(),
        debugLog: [...debugLog]
      });
      
      toast.success('✅ Composio MCP server created successfully!');
      
    } catch (error: any) {
      console.error('Connection test error:', error);
      addToDebugLog(`Connection Error: ${error.message}`);
      
      setConnectionResult({
        success: false,
        testType: 'connection',
        error: error.message,
        timestamp: new Date().toISOString(),
        debugLog: [...debugLog]
      });
      toast.error('Connection test failed: ' + error.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testEmailSending = async () => {
    if (!recipientEmail || !subject || !body) {
      toast.error('Please fill in all email fields');
      return;
    }

    if (!mcpServer?.ws_url) {
      toast.error('Please run connection test first to create MCP server');
      return;
    }

    setIsTestingEmail(true);
    setEmailResult(null);
    setDebugLog([]);
    
    try {
      addToDebugLog(`Connecting to MCP WebSocket: ${mcpServer.ws_url}`);
      
      // Connect to MCP WebSocket
      const ws = new WebSocket(mcpServer.ws_url);
      setWsConnection(ws);
      
      let messageId = 1;
      let emailSent = false;
      
      const sendMCPMessage = (method: string, params: any = {}) => {
        const message = {
          jsonrpc: '2.0',
          id: messageId++,
          method,
          params
        };
        addToDebugLog(`Sending MCP message: ${JSON.stringify(message)}`);
        ws.send(JSON.stringify(message));
      };

      ws.onopen = () => {
        addToDebugLog('WebSocket connected, initializing MCP...');
        sendMCPMessage('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'MBA SaaS', version: '1.0.0' }
        });
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        addToDebugLog(`Received: ${JSON.stringify(message)}`);
        
        if (message.method === 'initialized') {
          addToDebugLog('MCP initialized, listing tools...');
          sendMCPMessage('tools/list');
        } else if (message.result && message.result.tools) {
          addToDebugLog(`Available tools: ${JSON.stringify(message.result.tools)}`);
          
          // Call OUTLOOK_SEND_EMAIL tool
          addToDebugLog('Calling OUTLOOK_SEND_EMAIL tool...');
          sendMCPMessage('tools/call', {
            name: 'OUTLOOK_SEND_EMAIL',
            arguments: {
              to: recipientEmail,
              subject: subject,
              body: body
            }
          });
        } else if (message.result && !emailSent) {
          emailSent = true;
          addToDebugLog(`Email tool result: ${JSON.stringify(message.result)}`);
          
          setEmailResult({
            success: true,
            testType: 'email',
            data: message.result,
            timestamp: new Date().toISOString(),
            debugLog: [...debugLog]
          });
          
          toast.success('✅ Email sent successfully via Composio MCP!');
          ws.close();
        }
      };

      ws.onerror = (error) => {
        addToDebugLog(`WebSocket error: ${error}`);
        setEmailResult({
          success: false,
          testType: 'email',
          error: 'WebSocket connection failed',
          timestamp: new Date().toISOString(),
          debugLog: [...debugLog]
        });
        toast.error('❌ WebSocket connection failed');
      };

      ws.onclose = () => {
        addToDebugLog('WebSocket connection closed');
        setWsConnection(null);
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN && !emailSent) {
          ws.close();
          setEmailResult({
            success: false,
            testType: 'email',
            error: 'Timeout - Email sending took too long',
            timestamp: new Date().toISOString(),
            debugLog: [...debugLog]
          });
          toast.error('❌ Email sending timeout');
        }
      }, 30000);

    } catch (error: any) {
      console.error('Email test error:', error);
      addToDebugLog(`Email Error: ${error.message}`);
      
      setEmailResult({
        success: false,
        testType: 'email',
        error: error.message,
        timestamp: new Date().toISOString(),
        debugLog: [...debugLog]
      });
      toast.error('Email test failed: ' + error.message);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const renderResult = (result: TestResult | null, title: string) => {
    if (!result) return null;

    return (
      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold">{title}</h4>
          <Badge variant={result.success ? "default" : "destructive"}>
            {result.success ? 'Success' : 'Failed'}
          </Badge>
          {result.status && (
            <Badge variant="outline">Status: {result.status}</Badge>
          )}
        </div>
        <div className="text-sm space-y-2">
          <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
          {result.error && (
            <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
          )}
          {result.debugLog && result.debugLog.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Debug Log</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {result.debugLog.join('\n')}
              </pre>
            </details>
          )}
          {result.data && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Raw Response Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Composio MCP Frontend Test</h3>
        <p className="text-sm text-gray-600 mb-6">
          Direct frontend integration with Composio MCP API for Outlook email sending. 
          This bypasses edge functions for better debugging and faster iteration.
        </p>
      </div>

      {/* API Key Input */}
      <Card className="p-4 bg-yellow-50">
        <h4 className="font-semibold mb-2">API Configuration</h4>
        <div>
          <Label htmlFor="apiKey">Composio API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Composio API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is only stored temporarily in memory and never sent to our servers.
          </p>
        </div>
      </Card>

      {/* Connection Test */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">1. MCP Server Connection Test</h4>
        <p className="text-sm text-gray-600 mb-4">
          Create MCP server with auth config <code>ac_pfIe0Qy6LJq7</code> and test API connectivity.
        </p>
        
        {mcpServer && (
          <div className="mb-4 p-2 bg-green-50 rounded">
            <p className="text-sm"><strong>MCP Server:</strong> {mcpServer.id}</p>
            <p className="text-sm"><strong>Status:</strong> {mcpServer.status}</p>
            <p className="text-sm"><strong>WebSocket URL:</strong> {mcpServer.ws_url}</p>
          </div>
        )}
        
        <Button 
          onClick={testConnection}
          disabled={isTestingConnection || !apiKey.trim()}
          className="w-full"
        >
          {isTestingConnection ? 'Creating MCP Server...' : 'Create MCP Server'}
        </Button>
        {renderResult(connectionResult, 'MCP Server Creation Result')}
      </Card>

      {/* Email Test */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">2. Email Sending via MCP</h4>
        <p className="text-sm text-gray-600 mb-4">
          Connect to MCP server via WebSocket and send email using OUTLOOK_SEND_EMAIL tool.
        </p>
        
        {wsConnection && (
          <div className="mb-4 p-2 bg-blue-50 rounded">
            <p className="text-sm"><strong>WebSocket Status:</strong> {
              wsConnection.readyState === WebSocket.OPEN ? 'Connected' :
              wsConnection.readyState === WebSocket.CONNECTING ? 'Connecting' :
              wsConnection.readyState === WebSocket.CLOSING ? 'Closing' :
              'Closed'
            }</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="test@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              placeholder="Email body content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={testEmailSending}
            disabled={isTestingEmail || !recipientEmail || !subject || !body || !mcpServer}
            className="w-full"
          >
            {isTestingEmail ? 'Sending Email via MCP...' : 'Send Email via MCP WebSocket'}
          </Button>
        </div>
        
        {renderResult(emailResult, 'MCP Email Sending Result')}
      </Card>

      {/* Live Debug Log */}
      {debugLog.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Live Debug Log</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {debugLog.join('\n')}
          </pre>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">Test Instructions</h4>
        <ul className="text-sm space-y-1">
          <li>1. Enter your Composio API key in the configuration section</li>
          <li>2. Run connection test to create MCP server</li>
          <li>3. If successful, test email sending with a real email address</li>
          <li>4. Monitor the live debug log for detailed MCP protocol flow</li>
          <li>5. Check recipient's inbox to confirm email delivery</li>
        </ul>
      </Card>
    </div>
  );
};

export default ComposioMCPTest;