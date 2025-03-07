
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const n8nApiKey = Deno.env.get('N8N_API_KEY');

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
    const { companyName, userId, webhookUrl } = await req.json();
    console.log(`Triggering n8n workflow for company: ${companyName}, userId: ${userId}, webhook: ${webhookUrl}`);

    if (!companyName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Company name is required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "User ID is required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Webhook URL is required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create a Supabase client with the auth context of the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pqskutdrekcinpymvigm.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the n8n webhook with the company name
    console.log(`Calling n8n webhook at: ${webhookUrl}`);
    
    // Set appropriate timeout and don't use Authorization header unless needed
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ companyName })
    };
    
    // Only add Authorization header if we have an API key
    if (n8nApiKey) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${n8nApiKey}`
      };
    }
    
    let response;
    try {
      response = await fetch(webhookUrl, fetchOptions);
      console.log(`n8n response status: ${response.status} ${response.statusText}`);
    } catch (fetchError) {
      console.error('Network error when fetching from webhook:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Network error: ${fetchError.message}`,
          error: 'network_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502 // Bad Gateway
        }
      );
    }
    
    if (!response.ok) {
      // For non-200 responses, try to get error details
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = "Could not read response body";
      }
      
      console.error(`Error response from n8n (${response.status}):`, errorText);
      
      // If we get a 404, give a more specific error
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Webhook not found at ${webhookUrl}. Please check the URL.`,
            error: 'webhook_not_found',
            status: response.status
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Webhook request failed: ${response.status} ${response.statusText}`,
            error: 'webhook_error',
            status: response.status,
            details: errorText
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502 // We return a 502 Bad Gateway
          }
        );
      }
    }

    // Parse the response from n8n
    let responseData;
    try {
      responseData = await response.json();
      console.log('Parsed JSON response:', responseData);
    } catch (e) {
      console.log('Response is not JSON, using text response');
      try {
        const textResponse = await response.text();
        console.log('Text response:', textResponse);
        
        // If the response contains "workflow completed", create a simple object
        if (textResponse.includes('workflow completed')) {
          responseData = { 
            status: "success", 
            message: textResponse,
            company: companyName
          };
        } else {
          responseData = { response: textResponse };
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
        responseData = { 
          status: "unknown",
          message: "Could not parse webhook response"
        };
      }
    }
    
    console.log('Final webhook response to be stored:', responseData);

    // Mock data for test if response doesn't have useful data
    if (!responseData || Object.keys(responseData).length === 0) {
      console.log('Using mock data as response is empty');
      responseData = { 
        company: companyName,
        info: "This is test data as the real API returned an empty response",
        status: "Test"
      };
    }

    // Store the result in the database
    let dbResult;
    try {
      const { data, error } = await supabase
        .from('company_searches')
        .insert({
          user_id: userId,
          company_name: companyName,
          result: responseData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing company search result:', error);
        throw error;
      }
      
      dbResult = data;
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Even if DB operation fails, we want to return the API result to the user
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Company information retrieved but could not be stored',
          data: responseData,
          databaseError: dbError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 207 // Partial success
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company information retrieved and stored successfully',
        data: dbResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in trigger-n8n-workflow function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unexpected error occurred',
        error: 'server_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
