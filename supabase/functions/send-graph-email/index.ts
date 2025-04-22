
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
  cc?: string[];
  bcc?: string[];
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
    const { accessToken, to, subject, body, senderEmail, debug, cc, bcc } = emailRequest;
    
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
        tokenLength: accessToken.length,
        hasCC: Array.isArray(cc) && cc.length > 0,
        hasBCC: Array.isArray(bcc) && bcc.length > 0
      });
    }
    
    const emailContent: any = {
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
    
    // Add CC recipients if provided
    if (cc && cc.length > 0) {
      emailContent.message.ccRecipients = cc.map(address => ({
        emailAddress: { address }
      }));
      
      if (debug) {
        console.log(`Adding ${cc.length} CC recipients`);
      }
    }
    
    // Add BCC recipients if provided
    if (bcc && bcc.length > 0) {
      emailContent.message.bccRecipients = bcc.map(address => ({
        emailAddress: { address }
      }));
      
      if (debug) {
        console.log(`Adding ${bcc.length} BCC recipients`);
      }
    }
    
    // Add a retry mechanism
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        if (debug && retryCount > 0) {
          console.log(`Retry attempt ${retryCount} of ${maxRetries}`);
        }
        
        response = await fetch(GRAPH_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailContent),
        });
        
        // If successful, break out of retry loop
        if (response.ok) break;
        
        // If we get a 401 (Unauthorized), don't retry as the token is likely invalid
        if (response.status === 401) break;
        
        // For other errors, try again with a delay
        const errorData = await response.text();
        console.error(`Graph API error (attempt ${retryCount + 1}):`, errorData);
        
        if (retryCount < maxRetries) {
          // Wait for 1 second before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          retryCount++;
        } else {
          break;
        }
      } catch (fetchError) {
        console.error(`Fetch error (attempt ${retryCount + 1}):`, fetchError);
        
        if (retryCount < maxRetries) {
          // Wait for 1 second before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          retryCount++;
        } else {
          throw fetchError;
        }
      }
    }
    
    if (!response || !response.ok) {
      const errorData = await response?.text() || "No response received";
      console.error("Graph API error after retries:", errorData);
      
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
          statusCode: response?.status || 500,
          details: errorDetails,
          retryAttempts: retryCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response?.status || 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        retryAttempts: retryCount > 0 ? retryCount : undefined
      }),
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
