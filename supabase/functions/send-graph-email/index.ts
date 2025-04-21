
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MICROSOFT_GRAPH_URL = "https://graph.microsoft.com/v1.0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { 
      accessToken, 
      to, 
      subject, 
      body, 
      senderEmail,
      debug = false 
    } = requestBody;

    if (!accessToken || !to || !subject || !body) {
      throw new Error("Missing required email parameters");
    }

    if (debug) {
      console.log('Graph email function input:', {
        to,
        subject,
        bodyLength: body?.length || 0,
        accessTokenLength: accessToken?.length || 0,
        senderEmail
      });
    }

    const emailPayload = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        toRecipients: [{
          emailAddress: {
            address: to
          }
        }],
        // The from field is only used if the app has the right permissions
        ...(senderEmail ? {
          from: {
            emailAddress: {
              address: senderEmail
            }
          }
        } : {})
      },
      saveToSentItems: true // Save to the user's sent items folder
    };

    if (debug) {
      console.log('Sending email payload to Graph API:', JSON.stringify(emailPayload, null, 2));
    }

    // Make the Graph API request with detailed error handling
    try {
      console.log(`Making request to ${MICROSOFT_GRAPH_URL}/me/sendMail with token starting with: ${accessToken.substring(0, 15)}...`);
      
      const graphResponse = await fetch(`${MICROSOFT_GRAPH_URL}/me/sendMail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      // Get the full response text for debugging
      const responseText = await graphResponse.text();
      
      // Log the full response for debugging
      console.log(`Graph API response status: ${graphResponse.status}`);
      console.log('Graph API response headers:', Object.fromEntries(graphResponse.headers.entries()));
      console.log('Graph API response body:', responseText);

      if (!graphResponse.ok) {
        // Try to parse the error as JSON
        let errorDetails = {};
        try {
          errorDetails = JSON.parse(responseText);
        } catch (e) {
          errorDetails = { raw: responseText };
        }
        
        // Get the error details from the response
        const errorCode = errorDetails.error?.code || '';
        const errorMessage = errorDetails.error?.message || '';
        
        console.error('Graph API error:', { 
          status: graphResponse.status, 
          code: errorCode, 
          message: errorMessage 
        });
        
        // Handle common error scenarios with more specific responses
        
        // Permissions and consent issues
        if (responseText.includes('InvalidAuthenticationToken') || 
            responseText.includes('ExpiredAuthenticationToken') ||
            responseText.includes('AuthenticationFailed') ||
            responseText.includes('TokenExpired') ||
            graphResponse.status === 401) {
              
          console.error('Authentication token issue detected with Graph API');
          
          // Return helpful information about the token expiry
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Authentication token is invalid or expired', 
              errorCode: 'INVALID_TOKEN',
              details: {
                status: graphResponse.status,
                message: 'Please re-authenticate with Microsoft',
                rawError: errorDetails
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401
            }
          );
        }
        
        // Permission issues
        if (responseText.includes('Insufficient privileges') || 
            responseText.includes('Access denied') ||
            responseText.includes('Authorization_RequestDenied') ||
            responseText.includes('consent') ||
            graphResponse.status === 403) {
              
          console.error('Permission issue detected with Graph API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Insufficient permissions to send email via Graph API', 
              errorCode: 'INSUFFICIENT_PERMISSIONS',
              details: {
                status: graphResponse.status,
                message: 'Your application needs additional permissions. Please reconnect your Microsoft account.',
                rawError: errorDetails
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403
            }
          );
        }
        
        // Service errors
        if (graphResponse.status >= 500) {
          console.error('Microsoft service error detected');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Microsoft Graph API service error', 
              errorCode: 'SERVICE_ERROR',
              details: {
                status: graphResponse.status,
                message: 'Microsoft is experiencing service issues. Please try again later.',
                rawError: errorDetails
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: graphResponse.status
            }
          );
        }
        
        // Generic error fallback
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to send email: ${errorMessage || 'Unknown error'}`, 
            errorCode: errorCode || 'UNKNOWN_ERROR',
            details: {
              status: graphResponse.status,
              rawError: errorDetails
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: graphResponse.status || 500
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully via Microsoft Graph API' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (fetchError) {
      console.error('Error making Graph API request:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Network error when calling Microsoft Graph API', 
          errorCode: 'NETWORK_ERROR',
          details: {
            message: fetchError.message,
            name: fetchError.name
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error in send-graph-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        errorCode: 'FUNCTION_ERROR',
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
