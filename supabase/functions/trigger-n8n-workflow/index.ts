
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const n8nApiKey = Deno.env.get('N8N_API_KEY');
// This URL would need to be updated with the actual n8n webhook URL
const n8nWebhookUrl = "https://your-n8n-instance.com/webhook/company-info";

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
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nApiKey}`
      },
      body: JSON.stringify({ companyName })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from n8n:', errorText);
      throw new Error(`n8n workflow failed: ${response.status} ${response.statusText}`);
    }

    // Parse the response from n8n
    const n8nData = await response.json();
    console.log('n8n workflow response:', n8nData);

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
