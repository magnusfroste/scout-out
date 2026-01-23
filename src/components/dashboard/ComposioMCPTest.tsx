import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  testType: string;
  status?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

interface DiagnosticStep {
  name: string;
  success: boolean;
  data?: any;
  error?: string;
}

const ComposioMCPTest = () => {
  const { user } = useAuth();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
    const [emailResult, setEmailResult] = useState<TestResult | null>(null);
    const [diagnosticSteps, setDiagnosticSteps] = useState<DiagnosticStep[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
  // Email test form
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('ScoutOut - Composio MCP Test');
  const [body, setBody] = useState('This is a test email sent through Composio MCP from ScoutOut.');

  const testConnection = async () => {
    if (!user) {
      toast.error('Please log in to test MCP connection');
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      console.log(`Testing MCP connection for user ${user.id} via edge function...`);
      
      const { data, error } = await supabase.functions.invoke('test-composio-mcp', {
        body: { 
          testType: 'connection',
          userId: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Connection test result:', data);
      setConnectionResult(data);
      
      if (data.success) {
        toast.success('✅ MCP server instance created successfully!');
      } else {
        toast.error('❌ MCP server instance creation failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Connection test error:', error);
      setConnectionResult({
        success: false,
        testType: 'connection',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      toast.error('Connection test failed: ' + errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

    const runDiagnostic = async () => {
    if (!user) {
      toast.error('Please log in to run diagnostics');
      return;
    }

    setIsDiagnosing(true);
    setDiagnosticSteps([]);
    let authConfigId = '';

    try {
      // Step 1: Check DB
      const { data: dbData, error: dbError } = await supabase.functions.invoke('get-or-create-mcp-connection', {
        body: { step: 'check_db', userId: user.id, emailAddress: user.email! },
      });
                  const getErrorMessage = (error: any) => {
        if (!error) return undefined;
        // Supabase FunctionsHttpError has the detailed error in the context property
        if (error.context && error.context.error) return error.context.error;
        return error.message;
      }

      const dbResult = { name: 'Check Database', success: !dbError, data: dbData?.data, error: getErrorMessage(dbError) };
      setDiagnosticSteps(prev => [...prev, dbResult]);
      if (dbData?.data?.auth_config_id) {
        authConfigId = dbData.data.auth_config_id;
      }

      // Step 2: Get Auth Config
      if (!authConfigId) {
        const { data: authData, error: authError } = await supabase.functions.invoke('get-or-create-mcp-connection', {
          body: { step: 'get_auth_config', userId: user.id, emailAddress: user.email! },
        });
                        const authResult = { name: 'Get Auth Config', success: !authError, data: authData?.data, error: getErrorMessage(authError) };
        setDiagnosticSteps(prev => [...prev, authResult]);
        if (authData?.data?.authConfigId) {
          authConfigId = authData.data.authConfigId;
        } else {
          throw new Error('Failed to create or retrieve Auth Config ID.');
        }
      }

      // Step 3: Create MCP Server
      const { data: serverData, error: serverError } = await supabase.functions.invoke('get-or-create-mcp-connection', {
        body: { step: 'create_mcp_server', userId: user.id, emailAddress: user.email!, authConfigId },
      });
                  const serverResult = { name: 'Create MCP Server', success: !serverError, data: serverData?.data, error: getErrorMessage(serverError) };
      setDiagnosticSteps(prev => [...prev, serverResult]);
      if (!serverData?.data?.mcpServerId) {
        throw new Error('Failed to create or retrieve MCP Server ID.');
      }

      // Step 4: Get Connect URL
      const { data: urlData, error: urlError } = await supabase.functions.invoke('get-or-create-mcp-connection', {
        body: { 
          step: 'get_connect_url', 
          userId: user.id, 
          emailAddress: user.email!, 
          authConfigId, 
          redirectUrl: window.location.href 
        },
      });
                        const urlResult = { name: 'Get Connection URL', success: !urlError, data: urlData?.data, error: getErrorMessage(urlError) };
      setDiagnosticSteps(prev => [...prev, urlResult]);

      toast.success('Diagnostic complete!');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error('Diagnostic failed: ' + errorMessage);
      setDiagnosticSteps(prev => [...prev, { name: 'Overall Error', success: false, error: errorMessage }]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const testEmailSending = async () => {
    if (!user) {
      toast.error('Please log in to test email sending');
      return;
    }

    if (!recipientEmail || !subject || !body) {
      toast.error('Please fill in all email fields');
      return;
    }

    setIsTestingEmail(true);
    setEmailResult(null);
    
    try {
      console.log(`Testing email sending for user ${user.id} via MCP edge function...`);
      
      const { data, error } = await supabase.functions.invoke('test-composio-mcp', {
        body: { 
          testType: 'email',
          userId: user.id,
          recipientEmail,
          subject,
          body
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Email test result:', data);
      setEmailResult(data);
      
      if (data.success) {
        toast.success('✅ Email sent successfully via MCP!');
      } else {
        toast.error('❌ Email sending failed via MCP');
      }
    } catch (error: unknown) {
      console.error('Email test error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setEmailResult({
        success: false,
        testType: 'email',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      toast.error('Email test failed: ' + errorMessage);
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

    const renderDiagnosticSteps = () => {
    if (diagnosticSteps.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {diagnosticSteps.map((step, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold">{index + 1}. {step.name}</h5>
              <Badge variant={step.success ? 'default' : 'destructive'}>
                {step.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {step.error ? (
                <p className="text-red-600 font-mono">{step.error}</p>
              ) : step.data ? (
                <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
                  {JSON.stringify(step.data, null, 2)}
                </pre>
              ) : (
                <p>No data returned.</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">MCP Integration Test</h3>
        <p className="text-sm text-gray-600 mb-6">
          Test MCP integration for email sending via secure edge function using your configured email provider.
          This validates MCP server creation and email delivery capabilities.
        </p>
      </div>

      <Card className="p-4 border-blue-200 bg-blue-50">
        <h4 className="font-semibold mb-2">0. Connection Setup Diagnostic</h4>
        <p className="text-sm text-gray-600 mb-4">
          Run a step-by-step test of the entire connection flow to diagnose issues with your email provider.
        </p>
        <Button 
          onClick={runDiagnostic}
          disabled={isDiagnosing || !user}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {!user ? 'Please Log In' : isDiagnosing ? 'Running Diagnostic...' : 'Run Connection Diagnostic'}
        </Button>
        {renderDiagnosticSteps()}
      </Card>

      {/* Connection Test */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">1. MCP Server Connection Test</h4>
        <p className="text-sm text-gray-600 mb-4">
          Connect to existing MCP server with auth config <code>ac_pfIe0Qy6LJq7</code> and test API connectivity.
          User context is passed through the MCP protocol for personalized access.
        </p>
        
        {connectionResult?.data?.serverId && (
          <div className="mb-4 p-2 bg-green-50 rounded">
            <p className="text-sm"><strong>Server ID:</strong> {connectionResult.data.serverId}</p>
            <p className="text-sm"><strong>User ID:</strong> {connectionResult.data.userId}</p>
            <p className="text-sm"><strong>MCP URL:</strong> {connectionResult.data.mcpUrl}</p>
          </div>
        )}
        
        <Button 
          onClick={testConnection}
          disabled={isTestingConnection || !user}
          className="w-full"
        >
          {!user ? 'Please Log In' : isTestingConnection ? 'Testing MCP Connection...' : 'Test MCP Server Connection'}
        </Button>
        {renderResult(connectionResult, 'MCP Server Creation Result')}
      </Card>

      {/* Email Test */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">2. Email Sending via MCP Protocol</h4>
        <p className="text-sm text-gray-600 mb-4">
          Send email through Composio MCP using the OUTLOOK_SEND_EMAIL tool via WebSocket protocol.
        </p>
        
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
            disabled={isTestingEmail || !recipientEmail || !subject || !body || !user}
            className="w-full"
          >
            {!user ? 'Please Log In' : isTestingEmail ? 'Sending Email via MCP...' : 'Send Email via MCP Protocol'}
          </Button>
        </div>
        
        {renderResult(emailResult, 'MCP Email Sending Result')}
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">Test Instructions</h4>
        <ul className="text-sm space-y-1">
          <li>1. Make sure you're logged in - user context is passed through MCP protocol</li>
          <li>2. First run the MCP server connection test to verify API access</li>
          <li>3. If successful, test email sending with a real email address</li>
          <li>4. Monitor the browser console and edge function logs for detailed debugging</li>
          <li>5. Check recipient's inbox to confirm email delivery</li>
          <li>6. Review the detailed response data to understand the MCP protocol flow</li>
        </ul>
      </Card>
    </div>
  );
};

export default ComposioMCPTest;