
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
    console.log("Raw request body received");
    
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
      contentLength: emailRequest.html_content?.length,
      senderProvider: emailRequest.sender_settings?.provider || 'not specified',
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
      // Configure email client with deliverability settings
      console.log("Configuring email client with provider:", emailRequest.sender_settings.provider);
      
      const client = createSMTPClient({
        host: emailRequest.sender_settings.host,
        port: emailRequest.sender_settings.port,
        email: emailRequest.sender_settings.email,
        password: emailRequest.sender_settings.password
      });
      
      // Extract recipient name
      const recipientName = emailRequest.to_name || emailRequest.to.split('@')[0];
      
      // Add proper personalization and clean html
      const formattedHtmlContent = createEmailTemplate(
        emailRequest.html_content,
        recipientName,
        emailRequest.sender_settings.email
      );
      
      // Send email
      console.log("Sending email to:", emailRequest.to);
      
      // Create a friendly display name for the sender
      // Format: "Name via Master Business Agent <email@example.com>"
      const senderName = emailRequest.sender_settings.email.split('@')[0];
      const formattedSender = `${senderName} via Master Business Agent <${emailRequest.sender_settings.email}>`;
      
      const emailParams = {
        from: formattedSender,
        to: emailRequest.to,
        subject: emailRequest.subject,
        html: formattedHtmlContent
      };
      
      console.log("Email parameters prepared:", {
        to: emailParams.to,
        from: emailParams.from,
        subject: emailParams.subject,
      });
      
      // Enhanced error handling - save result to check for errors
      const result = await sendEmail(client, emailParams);
      if (!result.success) {
        throw new Error(result.error || "Unknown error sending email");
      }
      
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
          provider: emailRequest.sender_settings.provider,
          errorType: smtpError.name,
        }
      }, 500);
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return createJsonResponse({ 
      success: false, 
      error: `General error: ${error.message}`,
    }, 500);
  }
});
