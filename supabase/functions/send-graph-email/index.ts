
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
      console.log(`Graph API response status: ${graphResponse.status}, headers:`, 
                  Object.fromEntries(graphResponse.headers.entries()));
      console.log('Graph API response body:', responseText);

      if (!graphResponse.ok) {
        // Try to parse the error as JSON
        let errorDetails = {};
        try {
          errorDetails = JSON.parse(responseText);
        } catch (e) {
          errorDetails = { raw: responseText };
        }
        
        // Check for specific error types
        if (responseText.includes('Insufficient privileges') || 
            responseText.includes('Access denied') ||
            responseText.includes('Authorization_RequestDenied') ||
            responseText.includes('consent')) {
              
          console.error('Permission or consent issue detected with Graph API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Insufficient permissions or consent to send email via Graph API', 
              details: {
                error: errorDetails,
                message: 'The application may need additional permissions or consent from the user',
                raw: responseText,
                status: graphResponse.status
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403, // Use 403 to indicate permission/consent issues
            }
          );
        }
        
        // Check if authentication token is invalid
        if (responseText.includes('InvalidAuthenticationToken') || 
            responseText.includes('ExpiredAuthenticationToken') ||
            responseText.includes('AuthenticationFailed')) {
              
          console.error('Authentication token issue detected with Graph API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Authentication token is invalid or expired', 
              details: {
                error: errorDetails,
                message: 'Please re-authenticate with Microsoft',
                raw: responseText,
                status: graphResponse.status
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401, // Use 401 to indicate authentication issues
            }
          );
        }
        
        // Additional check for resource access validation errors
        if (responseText.includes('ResourceNotFound') || 
            responseText.includes('MailboxNotEnabledForRESTAPI')) {
              
          console.error('Resource access issue detected with Graph API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Microsoft Graph API cannot access mailbox resources', 
              details: {
                error: errorDetails,
                message: 'The mailbox may not be accessible via Microsoft Graph API',
                raw: responseText,
                status: graphResponse.status
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404, // Use 404 to indicate resource not found issues
            }
          );
        }
        
        // Check for throttling or service limits
        if (responseText.includes('throttle') || 
            responseText.includes('TooManyRequests') ||
            responseText.includes('429')) {
              
          console.error('Throttling detected with Graph API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Microsoft Graph API request is being throttled', 
              details: {
                error: errorDetails,
                message: 'Too many requests sent to Microsoft Graph API. Please try again later.',
                raw: responseText,
                status: graphResponse.status
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 429, // Use 429 to indicate rate limiting issues
            }
          );
        }
        
        throw new Error(`Failed to send email via Graph API: ${responseText}`);
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
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in send-graph-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
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
