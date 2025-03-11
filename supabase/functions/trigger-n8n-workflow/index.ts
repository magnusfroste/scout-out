
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pqskutdrekcinpymvigm.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log("Authentication provided correctly");
    } else {
      console.log("No authentication provided, continuing with service role");
    }

    // Parse the request body as JSON
    const { company, questions, website, userId, webhookUrl } = await req.json();
    
    console.log(`Calling webhook: ${webhookUrl}`);
    
    if ((!company && !website) || !webhookUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Company name/website and webhook URL are required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Call the webhook
    let response;
    try {
      console.log(`Sending webhook request to: ${webhookUrl}`);
      
      // Prepare the request payload
      const payload = website 
        ? { website } 
        : { company, questions };
      
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`Webhook response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Webhook error response: ${errorText}`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Webhook request failed: ${response.status}`,
            status: response.status
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502
          }
        );
      }
    } catch (fetchError) {
      console.error('Error fetching from webhook:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Network error: ${fetchError.message}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502
        }
      );
    }
    
    // Get the response data
    let responseData;
    
    try {
      // Parse the webhook response
      const responseJson = await response.json();
      console.log('Raw webhook response:', JSON.stringify(responseJson));
      
      // Return the raw response directly
      responseData = responseJson;
      
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      // If not JSON, try to get text
      try {
        const text = await response.text();
        console.log('Text response:', text);
        responseData = text;
      } catch (textError) {
        console.error('Error reading response:', textError);
        responseData = "Could not parse response";
      }
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
