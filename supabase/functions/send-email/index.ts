
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Using a more reliable email library for Deno
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailRequest {
  to: string;
  to_name?: string;
  subject: string;
  html_content: string;
  sender_settings: {
    email: string;
    host: string;
    port: number;
    password: string;
    provider: string;
  };
}

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Received email send request");
    
    // Log request headers for debugging
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Request headers:", headers);
    
    // Get request body as text first for logging
    const bodyText = await req.text();
    console.log("Raw request body:", bodyText);
    
    // Parse JSON
    let emailRequest: EmailRequest;
    try {
      emailRequest = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON data' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
    
    console.log("Request data parsed:", { 
      to: emailRequest.to,
      subject: emailRequest.subject,
      senderEmail: emailRequest.sender_settings?.email,
      senderHost: emailRequest.sender_settings?.host,
    });
    
    // Validate input
    if (!emailRequest || !emailRequest.to || !emailRequest.subject || !emailRequest.html_content || !emailRequest.sender_settings) {
      console.error("Missing required email data:", {
        hasTo: Boolean(emailRequest?.to),
        hasSubject: Boolean(emailRequest?.subject),
        hasContent: Boolean(emailRequest?.html_content),
        hasSenderSettings: Boolean(emailRequest?.sender_settings)
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required email data',
          received: {
            hasTo: Boolean(emailRequest?.to),
            hasSubject: Boolean(emailRequest?.subject),
            hasContent: Boolean(emailRequest?.html_content),
            hasSenderSettings: Boolean(emailRequest?.sender_settings)
          }
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Validate sender settings
    if (!emailRequest.sender_settings.email || 
        !emailRequest.sender_settings.host || 
        !emailRequest.sender_settings.port || 
        !emailRequest.sender_settings.password) {
      console.error("Missing required sender settings:", {
        hasEmail: Boolean(emailRequest.sender_settings.email),
        hasHost: Boolean(emailRequest.sender_settings.host),
        hasPort: Boolean(emailRequest.sender_settings.port),
        hasPassword: Boolean(emailRequest.sender_settings.password)
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required sender settings',
          details: {
            hasEmail: Boolean(emailRequest.sender_settings.email),
            hasHost: Boolean(emailRequest.sender_settings.host), 
            hasPort: Boolean(emailRequest.sender_settings.port),
            hasPassword: Boolean(emailRequest.sender_settings.password)
          }
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    try {
      // Configure email client using denomailer
      console.log("Configuring email client with:", {
        host: emailRequest.sender_settings.host,
        port: emailRequest.sender_settings.port,
        email: emailRequest.sender_settings.email
      });
      
      // Determine secure connection based on port
      const secure = emailRequest.sender_settings.port === 465;
      console.log(`Using ${secure ? 'secure' : 'non-secure'} connection`);
      
      const client = new SMTPClient({
        connection: {
          hostname: emailRequest.sender_settings.host,
          port: emailRequest.sender_settings.port,
          tls: secure,
          auth: {
            username: emailRequest.sender_settings.email,
            password: emailRequest.sender_settings.password,
          },
        },
        debug: true, // Enable debug mode for more logs
      });
      
      // Send email
      console.log("Sending email to:", emailRequest.to);
      
      const emailParams = {
        from: emailRequest.sender_settings.email,
        to: emailRequest.to,
        subject: emailRequest.subject,
        content: emailRequest.html_content,
        html: emailRequest.html_content,
        headers: {
          "Reply-To": emailRequest.sender_settings.email,
          "X-Priority": "3",
          "List-Unsubscribe": `<mailto:${emailRequest.sender_settings.email}?subject=Unsubscribe>`,
          "X-Mailer": "Master Business Agent",
          "Precedence": "bulk",
          "Message-ID": `<${Date.now()}.${Math.random().toString(36).substring(2)}@${emailRequest.sender_settings.host}>`,
          "MIME-Version": "1.0"
        }
      };
      
      console.log("Email parameters:", emailParams);
      
      const sendResult = await client.send(emailParams);
      console.log("Email send result:", sendResult);
      
      console.log("Email sent successfully");
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } catch (smtpError) {
      console.error("SMTP error:", smtpError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SMTP error: ${smtpError.message}`,
          details: {
            host: emailRequest.sender_settings.host,
            port: emailRequest.sender_settings.port,
            errorType: smtpError.name,
            errorStack: smtpError.stack
          }
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `General error: ${error.message}`,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
})
