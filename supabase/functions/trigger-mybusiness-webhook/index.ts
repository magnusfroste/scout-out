// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// For debugging purposes - list environment variables safely
const logEnvironmentVariables = () => {
  console.log("Checking for environment variables");
  try {
    // Check for specific environment variables without using keys()
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    const webhookUrl = Deno.env.get('MYBUSINESS_WEBHOOK_URL');
    
    console.log("SUPABASE_URL available:", !!supabaseUrl);
    console.log("SUPABASE_ANON_KEY/PUBLISHABLE_KEY available:", !!supabaseAnonKey);
    console.log("MYBUSINESS_WEBHOOK_URL available:", !!webhookUrl);
  } catch (error) {
    console.error("Error checking environment variables:", error.message);
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log("Received request to trigger-mybusiness-webhook");
    
    // Log environment variables for debugging
    logEnvironmentVariables();
    
    // Get the authorization header for authentication
    const authHeader = req.headers.get('authorization');
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized: Missing or invalid authorization header"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Create a Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || '';
    
    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Anon Key available:", !!supabaseAnonKey);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized: Invalid token"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    console.log('Authenticated user:', user.id);

    // Clone the request so we can read the body multiple times
    const clonedRequest = req.clone();
    
    // Parse the request body once
    const requestData = await clonedRequest.json();
    console.log('Request data:', requestData);

    // Get the webhook URL from Edge Function secrets
    const webhookUrl = Deno.env.get('MYBUSINESS_WEBHOOK_URL');
    console.log('MYBUSINESS_WEBHOOK_URL available:', !!webhookUrl);
    
    if (!webhookUrl) {
      console.error('MyBusiness webhook URL not configured in secrets');
      return new Response(JSON.stringify({
        success: false,
        message: "MyBusiness webhook URL not configured. Please configure MYBUSINESS_WEBHOOK_URL secret."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    console.log('Using webhook URL from secrets');

    // Input validation
    if (!requestData.website && !requestData.company) {
      console.error('Missing required parameters');
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required parameters: website or company name is required"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Prepare the payload for the webhook
    // Convert from our Edge Function format to the format expected by the webhook
    const webhookPayload = {
      url: requestData.website,
      company: requestData.company
    };
    
    console.log(`Forwarding request to webhook (using secret URL)`);
    console.log('Webhook payload:', webhookPayload);
    
    try {
      console.log(`Attempting to call webhook at: ${webhookUrl}`);
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      });
      
      return await processWebhookResponse(webhookResponse, corsHeaders, "Edge Function with Secret");
    } catch (error) {
      console.error(`Error calling webhook: ${error.message}`);
      // Return a more detailed error response
      return new Response(JSON.stringify({
        success: false,
        message: `Error calling webhook: ${error.message}`,
        details: {
          webhookUrl: webhookUrl.replace(/\/\/([^:\/]+:[^@\/]+)@/, '//***:***@'), // Mask any credentials in URL
          error: error.toString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502
      });
    }
  } catch (error) {
    console.error('Error in function:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'An unexpected error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Helper function to process webhook responses
async function processWebhookResponse(webhookResponse: Response, corsHeaders: Record<string, string>, method: string) {
  // Check for webhook response errors
  if (!webhookResponse.ok) {
    const errorText = await webhookResponse.text();
    console.error(`Webhook error (${webhookResponse.status}):`, errorText);
    return new Response(JSON.stringify({
      success: false,
      message: `Webhook request failed with status ${webhookResponse.status}`,
      details: errorText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 502
    });
  }

  // Parse and return the webhook response
  let responseData;
  try {
    responseData = await webhookResponse.json();
    console.log('Webhook response:', responseData);
  } catch (e) {
    // If response is not JSON, get it as text
    const textResponse = await webhookResponse.text();
    console.log('Webhook text response:', textResponse);
    responseData = { text: textResponse };
  }

  // Return successful response
  return new Response(JSON.stringify({
    success: true,
    data: responseData,
    method: method
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}
