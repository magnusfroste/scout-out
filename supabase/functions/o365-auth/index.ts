
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MICROSOFT_OAUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { code, clientId, clientSecret, redirectUri } = requestBody;

    if (!code || !clientId || !clientSecret || !redirectUri) {
      console.error('Missing required parameters', { 
        code: !!code, 
        clientId: !!clientId, 
        clientSecret: !!clientSecret, 
        redirectUri: !!redirectUri 
      });
      throw new Error("Missing required parameters");
    }

    console.log(`Exchanging code for tokens with redirect URI: ${redirectUri}`);

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${MICROSOFT_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://outlook.office.com/SMTP.Send offline_access',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      console.error('Status:', tokenResponse.status);
      throw new Error(`Failed to exchange code for tokens: ${errorText}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();
    console.log('Successfully obtained tokens');

    // Return only what's needed in the frontend
    return new Response(
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in o365-auth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
