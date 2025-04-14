
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import modules
import { corsHeaders, createJsonResponse } from "./cors.ts";
import { createEmailTemplate } from "./templates.ts";
import { createSMTPClient, sendEmail } from "./smtp-client.ts";
import { EmailRequest, validateEmailRequest } from "./validators.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return createJsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    console.log("Received email send request");
    
    // Get request body as text first for logging
    const bodyText = await req.text();
    console.log("Raw request body:", bodyText);
    
    // Parse JSON
    let emailRequest: EmailRequest;
    try {
      emailRequest = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return createJsonResponse({ success: false, error: 'Invalid JSON data' }, 400);
    }
    
    console.log("Request data parsed:", { 
      to: emailRequest.to,
      subject: emailRequest.subject,
      senderEmail: emailRequest.sender_settings?.email,
      senderHost: emailRequest.sender_settings?.host,
    });
    
    // Validate input
    const validation = validateEmailRequest(emailRequest);
    if (!validation.isValid) {
      console.error("Validation errors:", validation.errors);
      return createJsonResponse({ 
        success: false, 
        error: 'Missing required email data',
        errors: validation.errors
      }, 400);
    }

    try {
      // Configure email client
      console.log("Configuring email client with:", {
        host: emailRequest.sender_settings.host,
        port: emailRequest.sender_settings.port,
        email: emailRequest.sender_settings.email
      });
      
      const client = createSMTPClient({
        host: emailRequest.sender_settings.host,
        port: emailRequest.sender_settings.port,
        email: emailRequest.sender_settings.email,
        password: emailRequest.sender_settings.password
      });
      
      // Extract sender name if available (use email username as fallback)
      const senderName = emailRequest.to_name || emailRequest.sender_settings.email.split('@')[0];
      
      // Create a nicely formatted HTML email
      const formattedHtmlContent = createEmailTemplate(
        emailRequest.html_content,
        senderName,
        emailRequest.sender_settings.email
      );
      
      // Send email
      console.log("Sending email to:", emailRequest.to);
      
      const emailParams = {
        from: emailRequest.sender_settings.email,
        to: emailRequest.to,
        subject: emailRequest.subject,
        content: "Please view this email in an HTML-compatible email client.",
        html: formattedHtmlContent,
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
      
      await sendEmail(client, emailParams);
      console.log("Email sent successfully");
      
      return createJsonResponse({ success: true });
    } catch (smtpError) {
      console.error("SMTP error:", smtpError);
      return createJsonResponse({ 
        success: false, 
        error: `SMTP error: ${smtpError.message}`,
        details: {
          host: emailRequest.sender_settings.host,
          port: emailRequest.sender_settings.port,
          errorType: smtpError.name,
          errorStack: smtpError.stack
        }
      }, 500);
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return createJsonResponse({ 
      success: false, 
      error: `General error: ${error.message}`,
      stack: error.stack
    }, 500);
  }
});
