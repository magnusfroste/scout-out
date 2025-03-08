
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
    
    // Verify authentication if needed
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // We can use the token to verify the user if needed
      // But for now we'll just log it and proceed
      console.log("Authentication provided correctly");
    } else {
      console.log("No authentication provided, continuing with service role");
    }

    // Parse the request body as JSON
    const { company, questions, userId, webhookUrl } = await req.json();
    console.log(`Calling webhook for company: ${company}, webhook: ${webhookUrl}`);
    console.log(`Questions: ${JSON.stringify(questions)}`);

    if (!company || !webhookUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Company name and webhook URL are required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Call the webhook with the company name and questions using POST
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company, questions })
      });
      
      console.log(`Webhook response status: ${response.status}`);
      
      // Check for non-200 responses
      if (!response.ok) {
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
      responseData = await response.json();
      console.log('Response data:', responseData);
      
      // Handle the case where responseData is an array with a single object containing results
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].results) {
        responseData = responseData[0];
      }
      
    } catch (e) {
      // If not JSON, try to get text
      try {
        const text = await response.text();
        console.log('Text response:', text);
        responseData = { response: text };
      } catch (textError) {
        console.error('Error reading response:', textError);
        responseData = { message: "Could not parse response" };
      }
    }
    
    // Store the result if we have a user ID
    if (userId) {
      try {
        await supabase
          .from('company_searches')
          .insert({
            user_id: userId,
            company_name: company,
            result: responseData,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB storage fails
      }
    }

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
