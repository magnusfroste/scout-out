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

interface ComposioResponse {
  success: boolean;
  data?: any;
  error?: string;
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

  try {
    const composioApiKey = Deno.env.get('COMPOSIO_API_KEY');
    if (!composioApiKey) {
      throw new Error('Composio API key not configured');
    }

    const { testType, recipientEmail, subject, body }: TestMCPRequest = await req.json();
    
    console.log(`🧪 Starting Composio MCP test: ${testType}`);
    
    // Test 1: Basic API Connection
    if (testType === 'connection') {
      console.log('📡 Testing Composio API connection...');
      
      const connectionTest = await fetch('https://backend.composio.dev/api/v1/entities', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${composioApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const connectionData = await connectionTest.json();
      
      return new Response(JSON.stringify({
        success: connectionTest.ok,
        testType: 'connection',
        status: connectionTest.status,
        data: connectionData,
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

      console.log('📧 Testing email sending via Composio MCP...');
      
      // First, get available actions for Outlook
      const actionsResponse = await fetch('https://backend.composio.dev/api/v1/actions?appNames=outlook', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${composioApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const actionsData = await actionsResponse.json();
      console.log('📋 Available Outlook actions:', actionsData);

      // Execute the send email action using the auth config
      const emailPayload = {
        entityId: "mba_user_test", // We'll need to create this entity
        appName: "outlook",
        actionName: "OUTLOOK_SEND_EMAIL",
        input: {
          to: recipientEmail,
          subject: subject,
          body: body
        },
        authConfig: {
          authConfigId: "ac_pfle0Qy6LJq7"
        }
      };

      console.log('📤 Sending email payload:', emailPayload);

      const emailResponse = await fetch('https://backend.composio.dev/api/v1/actions/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${composioApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      const emailResult = await emailResponse.json();
      
      return new Response(JSON.stringify({
        success: emailResponse.ok,
        testType: 'email',
        status: emailResponse.status,
        availableActions: actionsData,
        emailPayload: emailPayload,
        emailResult: emailResult,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid test type');

  } catch (error: any) {
    console.error('❌ Composio MCP test failed:', error);
    
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