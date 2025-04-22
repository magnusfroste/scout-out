
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_ENDPOINT = "https://graph.microsoft.com/v1.0/me/sendMail";

interface GraphEmailRequest {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
  senderEmail: string;
  debug?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    const emailRequest: GraphEmailRequest = await req.json();
    const { accessToken, to, subject, body, senderEmail, debug } = emailRequest;
    
    if (!accessToken || !to || !subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (debug) {
      console.log("Sending email via Graph API:", {
        to,
        subject,
        bodyLength: body.length,
        senderEmail,
        tokenLength: accessToken.length
      });
    }
    
    const emailContent = {
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
        from: {
          emailAddress: {
            address: senderEmail,
          },
        },
      },
      saveToSentItems: true,
    };
    
    const response = await fetch(GRAPH_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailContent),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Graph API error:", errorData);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorData);
      } catch {
        errorDetails = { error: { message: errorData } };
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorDetails.error?.message || "Error sending email via Graph API",
          statusCode: response.status,
          details: errorDetails,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in send-graph-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error sending email via Graph API",
        details: {
          stack: error.stack,
          name: error.name
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
