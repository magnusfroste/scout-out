
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Consistent with n8n: https://login.microsoftonline.com/common/oauth2/v2.0/token
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
    console.log('Code length:', code?.length || 0);
    console.log('Client ID length:', clientId?.length || 0);
    console.log('Client Secret length:', clientSecret?.length || 0);

    // Enhanced logging
    console.log(`Full client request details:
      - OAuth flow: Microsoft Office 365
      - Code provided: ${code ? 'Yes' : 'No'}
      - Client ID: ${clientId.substring(0, 6)}...
      - Redirect URI: ${redirectUri}
      - Token endpoint: ${MICROSOFT_OAUTH_URL}/token
    `);
    
    // Log the exact token request we're making for comparison with n8n
    const tokenRequestParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      // Match the scope used by n8n - using combined Mail.Send and SMTP.Send for maximum compatibility
      scope: 'https://outlook.office.com/SMTP.Send https://graph.microsoft.com/Mail.Send offline_access',
    });
    
    console.log('Making token request with these parameters:', {
      endpoint: `${MICROSOFT_OAUTH_URL}/token`,
      grant_type: 'authorization_code',
      client_id_prefix: clientId.substring(0, 6) + '...',
      redirect_uri: redirectUri,
      scope: 'https://outlook.office.com/SMTP.Send https://graph.microsoft.com/Mail.Send offline_access',
      has_code: !!code,
      has_client_secret: !!clientSecret,
    });

    // Exchange authorization code for tokens
    // Using the same token endpoint as n8n: https://login.microsoftonline.com/common/oauth2/v2.0/token
    const tokenResponse = await fetch(`${MICROSOFT_OAUTH_URL}/token`, {
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
      
      // Try to parse error response
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { error: 'unknown', error_description: errorText };
      }
      
      // Enhanced error diagnostics
      console.error('Detailed OAuth error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorType: errorDetails.error,
        errorDescription: errorDetails.error_description,
        redirectUri: redirectUri
      });
      
      // Check for specific error conditions
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
    
    // Log the token structure (without revealing actual token)
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
      JSON.stringify({ 
        error: error.message,
        details: {
          stack: error.stack,
          name: error.name,
          // Additional context to help troubleshoot
          note: "If this is an OAuth error, please verify your Application (Client) ID, Client Secret, and Redirect URI in Azure Portal. Make sure the app has the SMTP.Send and Mail.Send permissions."
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
