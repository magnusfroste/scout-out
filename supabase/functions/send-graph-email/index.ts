
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

    const graphResponse = await fetch(`${MICROSOFT_GRAPH_URL}/me/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!graphResponse.ok) {
      const errorText = await graphResponse.text();
      console.error('Graph API email send error:', errorText);
      
      // Try to extract detailed error information
      let errorDetails = {};
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        errorDetails = { raw: errorText };
      }
      
      throw new Error(`Failed to send email via Graph API: ${errorText}`);
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
