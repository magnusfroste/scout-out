import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  testType: string;
  status?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

const ComposioMCPTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [emailResult, setEmailResult] = useState<TestResult | null>(null);
  
  // Email test form
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('MBA SaaS - Composio MCP Test');
  const [body, setBody] = useState('This is a test email sent through Composio MCP from MBA SaaS application.');

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      console.log('Testing MCP connection via edge function...');
      
      const { data, error } = await supabase.functions.invoke('test-composio-mcp', {
        body: { testType: 'connection' }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Connection test result:', data);
      setConnectionResult(data);
      
      if (data.success) {
        toast.success('✅ MCP server created successfully!');
      } else {
        toast.error('❌ MCP server creation failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setConnectionResult({
        success: false,
        testType: 'connection',
        error: error.message,
        timestamp: new Date().toISOString()
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

    setIsTestingEmail(true);
    setEmailResult(null);
    
    try {
      console.log('Testing email sending via MCP edge function...');
      
      const { data, error } = await supabase.functions.invoke('test-composio-mcp', {
        body: { 
          testType: 'email',
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
    } catch (error: any) {
      console.error('Email test error:', error);
      setEmailResult({
        success: false,
        testType: 'email',
        error: error.message,
        timestamp: new Date().toISOString()
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
        <h3 className="text-lg font-semibold mb-4">Composio MCP Integration Test</h3>
        <p className="text-sm text-gray-600 mb-6">
          Test Composio MCP integration for Outlook email sending via secure edge function.
          This validates MCP server creation and email delivery capabilities.
        </p>
      </div>

      {/* Connection Test */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">1. MCP Server Creation Test</h4>
        <p className="text-sm text-gray-600 mb-4">
          Create MCP server with auth config <code>ac_pfIe0Qy6LJq7</code> and test API connectivity.
        </p>
        
        {connectionResult?.data?.serverId && (
          <div className="mb-4 p-2 bg-green-50 rounded">
            <p className="text-sm"><strong>Server ID:</strong> {connectionResult.data.serverId}</p>
            <p className="text-sm"><strong>MCP URL:</strong> {connectionResult.data.mcpUrl}</p>
          </div>
        )}
        
        <Button 
          onClick={testConnection}
          disabled={isTestingConnection}
          className="w-full"
        >
          {isTestingConnection ? 'Creating MCP Server...' : 'Test MCP Server Creation'}
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
            disabled={isTestingEmail || !recipientEmail || !subject || !body}
            className="w-full"
          >
            {isTestingEmail ? 'Sending Email via MCP...' : 'Send Email via MCP Protocol'}
          </Button>
        </div>
        
        {renderResult(emailResult, 'MCP Email Sending Result')}
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">Test Instructions</h4>
        <ul className="text-sm space-y-1">
          <li>1. First run the MCP server creation test to verify API access</li>
          <li>2. If successful, test email sending with a real email address</li>
          <li>3. Monitor the browser console and edge function logs for detailed debugging</li>
          <li>4. Check recipient's inbox to confirm email delivery</li>
          <li>5. Review the detailed response data to understand the MCP protocol flow</li>
        </ul>
      </Card>
    </div>
  );
};

export default ComposioMCPTest;