
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Company Research webhook function triggered');
    const { company, questions } = await req.json();
    
    // Get authorization header from the incoming request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get webhook URL from secret first, then fallback to database
    let webhookUrl = Deno.env.get('COMPANY_RESEARCH_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log('Secret not found, attempting database fallback');
      // Fallback to database (will be removed in Phase 2)
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('url')
        .single();
        
      if (error || !data?.url) {
        throw new Error('No webhook URL configured');
      }
      
      webhookUrl = data.url;
      console.log('Using database fallback URL');
    } else {
      console.log('Using secret-based webhook URL');
    }

    console.log('Making request to webhook for company:', company);
    console.log('Questions count:', questions.length);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'X-Client-Info': 'Edge Function'
      },
      body: JSON.stringify({
        company,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question
        }))
      })
    });

    if (!response.ok) {
      console.error('Webhook error status:', response.status);
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Webhook response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in company research webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
