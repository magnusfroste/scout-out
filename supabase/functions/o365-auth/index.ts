
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MICROSOFT_GRAPH_URL = "https://graph.microsoft.com/v1.0";
const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";

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
      throw new Error("Missing required parameters");
    }

    const tokenRequestParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      // Include both SMTP and Graph Mail.Send scopes - Graph API is preferred
      scope: 'offline_access https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read'
    });
    
    const tokenResponse = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestParams,
    });

    const responseStatus = tokenResponse.status;
    console.log('Token response status:', responseStatus);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      console.error('Status:', tokenResponse.status);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { error: 'unknown', error_description: errorText };
      }
      
      console.error('Detailed OAuth error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorType: errorDetails.error,
        errorDescription: errorDetails.error_description,
        redirectUri: redirectUri
      });
      
      if (errorDetails.error === 'invalid_client') {
        throw new Error(`Invalid client credentials. Please verify your Client ID and Client Secret in Azure Portal.`);
      } else if (errorDetails.error === 'invalid_grant') {
        throw new Error(`Invalid or expired authorization code. Please try authenticating again.`);
      } else if (errorDetails.error === 'unauthorized_client') {
        throw new Error(`The application is not authorized to request an authorization code or token. Verify permissions in Azure Portal.`);
      }
      
      throw new Error(`Failed to exchange code for tokens: ${errorDetails.error_description || errorText}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();
    console.log('Successfully obtained tokens');
    console.log('Access token length:', tokens.access_token?.length || 0);
    console.log('Refresh token length:', tokens.refresh_token?.length || 0);
    console.log('Token expires in:', tokens.expires_in);
    console.log('Token type:', tokens.token_type);
    
    console.log('Token structure analysis:', {
      access_token_length: tokens.access_token?.length || 0,
      access_token_prefix: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'none',
      refresh_token_length: tokens.refresh_token?.length || 0,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
    });

    if (!tokens.refresh_token) {
      console.error('No refresh token received!');
      throw new Error('No refresh token received from Microsoft. Please try again.');
    }

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
      JSON.stringify({ 
        error: error.message,
        details: {
          stack: error.stack,
          name: error.name,
          note: "Ensure your Azure app has the correct Microsoft Graph API permissions."
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
