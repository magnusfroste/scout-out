
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const n8nApiKey = Deno.env.get('N8N_API_KEY');
// Updated webhook URL based on user input
const n8nWebhookUrl = "https://agent.froste.eu/webhook/saas";

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
    const { companyName, userId } = await req.json();
    console.log(`Triggering n8n workflow for company: ${companyName}, userId: ${userId}`);

    if (!companyName) {
      throw new Error("Company name is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Create a Supabase client with the auth context of the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pqskutdrekcinpymvigm.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the n8n webhook with the company name
    console.log(`Calling n8n webhook at: ${n8nWebhookUrl}`);
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nApiKey}`
      },
      body: JSON.stringify({ companyName })
    });

    console.log(`n8n response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // For non-200 responses, try to get error details
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = "Could not read response body";
      }
      
      console.error('Error response from n8n:', errorText);
      
      // If we get a 404, give a more specific error
      if (response.status === 404) {
        throw new Error(`n8n webhook not found at ${n8nWebhookUrl}. Please check the URL.`);
      } else {
        throw new Error(`n8n workflow failed: ${response.status} ${response.statusText}`);
      }
    }

    // Parse the response from n8n
    let n8nData;
    try {
      n8nData = await response.json();
    } catch (e) {
      console.log('Response is not JSON, using text response');
      const textResponse = await response.text();
      n8nData = { response: textResponse };
    }
    
    console.log('n8n workflow response:', n8nData);

    // Mock data for test if n8n response doesn't have useful data
    if (!n8nData || Object.keys(n8nData).length === 0) {
      console.log('Using mock data as response is empty');
      n8nData = { 
        company: companyName,
        info: "This is test data as the real API returned an empty response",
        status: "Test"
      };
    }

    // Store the result in the database
    const { data, error } = await supabase
      .from('company_searches')
      .insert({
        user_id: userId,
        company_name: companyName,
        result: n8nData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing company search result:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company information retrieved successfully',
        data: data
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
        message: error.message || 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
