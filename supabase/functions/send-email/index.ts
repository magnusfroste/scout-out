
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
    console.log("Raw request body received, length:", bodyText.length);
    
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
      senderHost: emailRequest.sender_settings?.host,
      senderPort: emailRequest.sender_settings?.port,
      hasPassword: !!emailRequest.sender_settings?.password,
      passwordLength: emailRequest.sender_settings?.password ? emailRequest.sender_settings.password.length : 0,
      hasOauth2: !!emailRequest.sender_settings?.oauth2,
    });
    
    // Enhanced logging for OAuth2 settings
    if (emailRequest.sender_settings?.oauth2) {
      console.log("OAuth2 settings details:", {
        provider: emailRequest.sender_settings.provider,
        user: emailRequest.sender_settings.oauth2.user,
        clientIdLength: emailRequest.sender_settings.oauth2.clientId?.length || 0,
        clientSecretLength: emailRequest.sender_settings.oauth2.clientSecret?.length || 0,
        refreshTokenLength: emailRequest.sender_settings.oauth2.refreshToken?.length || 0,
        accessUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scope: "https://outlook.office.com/SMTP.Send https://graph.microsoft.com/Mail.Send"
      });
    }
    
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

    // Check for Office365 provider with no OAuth2
    if (emailRequest.sender_settings.provider === 'office365' && !emailRequest.sender_settings.oauth2) {
      console.error("OAuth2 settings are required for Office365");
      return createJsonResponse({ 
        success: false, 
        error: 'OAuth2 settings are required for Office365', 
      }, 400);
    }

    // For Office365, verify OAuth2 settings are complete
    if (emailRequest.sender_settings.provider === 'office365' && emailRequest.sender_settings.oauth2) {
      const oauth2 = emailRequest.sender_settings.oauth2;
      if (!oauth2.user || !oauth2.clientId || !oauth2.clientSecret || !oauth2.refreshToken) {
        const missingFields = [];
        if (!oauth2.user) missingFields.push('user');
        if (!oauth2.clientId) missingFields.push('clientId');
        if (!oauth2.clientSecret) missingFields.push('clientSecret');
        if (!oauth2.refreshToken) missingFields.push('refreshToken');
        
        console.error("Incomplete OAuth2 settings for Office365:", missingFields);
        return createJsonResponse({ 
          success: false, 
          error: `Incomplete OAuth2 settings for Office365. Missing: ${missingFields.join(', ')}`,
        }, 400);
      }
      
      console.log("Office365 OAuth2 settings validated successfully");
    }

    try {
      // Configure email client with deliverability settings
      console.log("Configuring email client with provider:", emailRequest.sender_settings.provider);
      
      // Create SMTP client configuration
      const smtpConfig: any = {
        host: emailRequest.sender_settings.host,
        port: emailRequest.sender_settings.port,
        email: emailRequest.sender_settings.email,
        provider: emailRequest.sender_settings.provider
      };
      
      // Add appropriate authentication based on provider
      if (emailRequest.sender_settings.provider === 'office365' && emailRequest.sender_settings.oauth2) {
        console.log("Setting up Office365 OAuth2 authentication");
        smtpConfig.oauth2 = emailRequest.sender_settings.oauth2;
        
        // Make sure password is not set for OAuth2
        delete smtpConfig.password;
        
        console.log("OAuth2 config prepared:", {
          user: smtpConfig.oauth2.user,
          clientIdLength: smtpConfig.oauth2.clientId?.length || 0,
          clientSecretLength: smtpConfig.oauth2.clientSecret?.length || 0,
          refreshTokenLength: smtpConfig.oauth2.refreshToken?.length || 0
        });
        
        // Detailed logging for OAuth2 config to help diagnose issues
        console.log("Office365 OAuth2 full config (redacted secrets):", {
          clientId: smtpConfig.oauth2.clientId?.substring(0, 8) + '...',
          user: smtpConfig.oauth2.user,
          accessUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          scope: "https://outlook.office.com/SMTP.Send https://graph.microsoft.com/Mail.Send",
          hasClientSecret: !!smtpConfig.oauth2.clientSecret,
          hasRefreshToken: !!smtpConfig.oauth2.refreshToken,
        });
      } else if (emailRequest.sender_settings.password) {
        console.log("Setting up password authentication");
        smtpConfig.password = emailRequest.sender_settings.password;
      } else {
        throw new Error("Missing authentication credentials");
      }
      
      console.log("Creating SMTP client");
      const client = createSMTPClient(smtpConfig);
      
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
      // Format: "Name via ScoutOut <email@example.com>"
      const senderName = emailRequest.sender_settings.email.split('@')[0];
      const formattedSender = `${senderName} via ScoutOut <${emailRequest.sender_settings.email}>`;
      
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
        console.error("Email sending failed with error:", result.error, "Details:", result.details);
        
        // Special handling for Office 365 SMTP authentication disabled error
        if (result.details?.errorCode === "SMTP_AUTH_DISABLED") {
          return createJsonResponse({ 
            success: false, 
            error: result.error,
            details: result.details,
            errorCode: "SMTP_AUTH_DISABLED",
            microsoftDocs: "https://aka.ms/smtp_auth_disabled"
          }, 403); // Using 403 for permission issues
        }
        
        return createJsonResponse({ 
          success: false, 
          error: result.error || "Unknown error sending email",
          details: result.details || {}
        }, 500);
      }
      
      console.log("Email sent successfully");
      
      return createJsonResponse({ success: true });
    } catch (smtpError: any) {
      console.error("SMTP error:", smtpError, "Stack:", smtpError.stack);
      
      // Check for common Office 365 errors
      if (smtpError.message && smtpError.message.includes('SmtpClientAuthentication is disabled')) {
        return createJsonResponse({ 
          success: false, 
          error: `Microsoft has disabled SMTP Authentication for your tenant. Please visit https://aka.ms/smtp_auth_disabled for more information.`,
          details: {
            errorCode: "SMTP_AUTH_DISABLED",
            microsoftDocs: "https://aka.ms/smtp_auth_disabled"
          }
        }, 403);
      }
      
      return createJsonResponse({ 
        success: false, 
        error: `SMTP error: ${smtpError.message}`,
        details: {
          host: emailRequest.sender_settings.host,
          port: emailRequest.sender_settings.port,
          provider: emailRequest.sender_settings.provider,
          errorType: smtpError.name,
          errorCode: smtpError.code,
          stack: smtpError.stack
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
