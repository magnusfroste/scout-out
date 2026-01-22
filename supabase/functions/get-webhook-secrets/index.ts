import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mask a URL, showing only the beginning
function maskUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const pathParts = parsed.pathname.split('/');
    
    // Show host and first path segment, mask the rest
    if (pathParts.length > 2) {
      const maskedPath = pathParts.slice(0, 3).join('/') + '/***';
      return `${parsed.protocol}//${host}${maskedPath}`;
    }
    
    return `${parsed.protocol}//${host}/***`;
  } catch {
    // If not a valid URL, just mask most of it
    if (url.length > 20) {
      return url.substring(0, 20) + '***';
    }
    return '***';
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook secrets and mask them
    const webhookSecrets = {
      MYBUSINESS_WEBHOOK_URL: maskUrl(Deno.env.get('MYBUSINESS_WEBHOOK_URL')),
      QUESTIONS_WEBHOOK_URL: maskUrl(Deno.env.get('QUESTIONS_WEBHOOK_URL')),
      COMPANY_RESEARCH_WEBHOOK_URL: maskUrl(Deno.env.get('COMPANY_RESEARCH_WEBHOOK_URL')),
      VALUE_PROPOSITION_WEBHOOK_URL: maskUrl(Deno.env.get('VALUE_PROPOSITION_WEBHOOK_URL')),
    };

    return new Response(
      JSON.stringify({ secrets: webhookSecrets }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching webhook secrets:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
