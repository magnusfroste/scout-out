import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";

// Updated scopes to match n8n implementation
const OUTLOOK_SCOPES = [
  'openid',
  'offline_access',
  'Contacts.Read',
  'Contacts.ReadWrite', 
  'Calendars.Read',
  'Calendars.Read.Shared',
  'Calendars.ReadWrite',
  'Mail.ReadWrite',
  'Mail.ReadWrite.Shared',
  'Mail.Send',
  'Mail.Send.Shared',
  'MailboxSettings.Read',
];

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface ErrorResponse {
  error: string;
  error_description: string;
  error_codes?: number[];
  timestamp?: string;
  trace_id?: string;
  correlation_id?: string;
  suberror?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { clientId, clientSecret, refreshToken } = requestBody;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Missing required parameters for token refresh");
    }

    console.log('Refreshing token with client ID:', clientId.substring(0, 5) + '...');
    console.log('Refresh token length:', refreshToken.length);
    console.log('Using scopes:', OUTLOOK_SCOPES.join(' '));

    const tokenRequestParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: OUTLOOK_SCOPES.join(' ')
    });
    
    console.log(`Making token refresh request to ${MICROSOFT_AUTH_URL}/token`);
    const tokenResponse = await fetch(`${MICROSOFT_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestParams,
    });

    console.log(`Token refresh response status: ${tokenResponse.status}`);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh error:', errorText);
      
      let errorDetails: ErrorResponse;
      try {
        errorDetails = JSON.parse(errorText);
        console.error('Parsed error details:', errorDetails);
      } catch {
        errorDetails = { error: 'unknown', error_description: errorText };
        console.error('Could not parse error as JSON:', errorText);
      }
      
      // Check for admin consent required error
      if (errorDetails.error === 'invalid_grant' && 
          (errorDetails.error_description.includes('AADSTS65001') || 
           errorDetails.error_description.includes('consent'))) {
        console.error('Consent required for the application');
        // Return a specific error for consent required
        return new Response(
          JSON.stringify({ 
            error: 'consent_required',
            error_description: errorDetails.error_description,
            details: {
              correlation_id: errorDetails.correlation_id,
              trace_id: errorDetails.trace_id,
              error_codes: errorDetails.error_codes,
              note: "User needs to go through interactive authentication"
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403, // Use 403 to indicate permission issue
          }
        );
      }
      
      // Other errors related to invalid refresh token
      if (errorDetails.error === 'invalid_grant') {
        console.error('Invalid refresh token detected');
        return new Response(
          JSON.stringify({ 
            error: 'invalid_grant',
            error_description: errorDetails.error_description,
            details: {
              correlation_id: errorDetails.correlation_id,
              trace_id: errorDetails.trace_id,
              error_codes: errorDetails.error_codes,
              note: "The refresh token is invalid or has expired. User needs to re-authenticate."
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401, // Use 401 to indicate authentication issue
          }
        );
      }
      
      // Handle invalid client credentials
      if (errorDetails.error === 'invalid_client') {
        console.error('Invalid client credentials');
        return new Response(
          JSON.stringify({ 
            error: 'invalid_client',
            error_description: errorDetails.error_description,
            details: {
              correlation_id: errorDetails.correlation_id,
              trace_id: errorDetails.trace_id,
              error_codes: errorDetails.error_codes,
              note: "The client ID or client secret is incorrect. Please check your Azure app registration."
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401, // Use 401 to indicate authentication issue
          }
        );
      }
      
      // Generic error fallback
      return new Response(
        JSON.stringify({ 
          error: errorDetails.error || 'unknown_error',
          error_description: errorDetails.error_description || 'An unknown error occurred',
          details: {
            correlation_id: errorDetails.correlation_id,
            trace_id: errorDetails.trace_id,
            error_codes: errorDetails.error_codes
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const tokens: TokenResponse = await tokenResponse.json();
    console.log('Successfully refreshed tokens');
    console.log('Access token length:', tokens.access_token?.length || 0);
    console.log('New refresh token length:', tokens.refresh_token?.length || 0);
    console.log('Token expires in:', tokens.expires_in);
    
    // Store the new refresh token if provided
    if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
      console.log('New refresh token received, should be stored');
    }

    return new Response(
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refreshToken, // Return the new refresh token if present
        expires_in: tokens.expires_in,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in o365-auth-refresh function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: {
          stack: error.stack,
          name: error.name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
