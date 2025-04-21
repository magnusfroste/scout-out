
import nodemailer from 'npm:nodemailer';

export function createSMTPClient(config: any) {
  try {
    console.log('Creating SMTP client with config:', {
      host: config.host,
      port: config.port,
      email: config.email,
      provider: config.provider,
      hasPassword: !!config.password,
      hasOAuth2: !!config.oauth2
    });
    
    const connectionConfig: any = {
      host: config.host,
      port: config.port,
      secure: false,
      // Always require TLS for security
      requireTLS: true,
      // Increase timeouts to avoid connection errors
      connectionTimeout: 15000,
      socketTimeout: 15000,
      // Debug flag for more logging
      debug: true,
      // IMPORTANT: Verify server certificate to prevent MITM attacks
      tls: {
        rejectUnauthorized: true
      },
      // Add logging for better diagnostics
      logger: true
    };
    
    // Add appropriate authentication based on provider
    if (config.oauth2) {
      if (config.provider === 'office365' && 
          (!config.oauth2.user || !config.oauth2.clientId || 
           !config.oauth2.clientSecret || !config.oauth2.refreshToken)) {
        console.error("Invalid Office365 OAuth2 configuration:", {
          hasUser: !!config.oauth2.user,
          hasClientId: !!config.oauth2.clientId,
          hasClientSecret: !!config.oauth2.clientSecret,
          hasRefreshToken: !!config.oauth2.refreshToken
        });
        throw new Error("Incomplete OAuth2 configuration for Office365");
      }
      
      // Using OAuth2 authentication (primarily for Office365)
      connectionConfig.auth = {
        user: config.oauth2.user,
        type: "OAuth2",
        clientId: config.oauth2.clientId,
        clientSecret: config.oauth2.clientSecret,
        refreshToken: config.oauth2.refreshToken,
        // Microsoft OAuth token endpoint
        accessUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        // Required scope for sending email
        scope: "https://outlook.office.com/SMTP.Send",
      };
      
      console.log("OAuth2 configuration for SMTP:", {
        method: "XOAUTH2",
        user: config.oauth2.user,
        hasRequiredFields: !!(
          config.oauth2.user && 
          config.oauth2.clientId && 
          config.oauth2.clientSecret && 
          config.oauth2.refreshToken
        ),
        accessUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scope: "https://outlook.office.com/SMTP.Send",
        refreshTokenLength: config.oauth2.refreshToken ? config.oauth2.refreshToken.length : 0
      });
    } else if (config.password) {
      // Traditional password authentication
      connectionConfig.auth = {
        user: config.email,
        pass: config.password
      };
      console.log("Password authentication configured for SMTP");
    } else {
      console.error("No authentication method provided for SMTP client");
      throw new Error("No authentication method provided (password or OAuth2)");
    }
    
    return nodemailer.createTransport(connectionConfig);
  } catch (error) {
    console.error("Error creating SMTP client:", error);
    throw error;
  }
}

export async function sendEmail(client: any, params: any) {
  try {
    console.log("Sending email with params:", {
      from: params.from,
      to: params.to,
      subject: params.subject,
    });
    
    // Verify SMTP connection before sending
    console.log("Verifying SMTP connection...");
    try {
      await client.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError: any) {
      console.error("SMTP connection verification failed:", verifyError);
      console.error("Full error details:", JSON.stringify(verifyError, null, 2));
      
      // Enhanced Office 365 SMTP authentication disabled detection
      if (verifyError.message && (
          verifyError.message.includes('SmtpClientAuthentication is disabled') ||
          verifyError.message.includes('SMTP Auth is disabled') ||
          verifyError.message.includes('SMTP-AUTH') ||
          verifyError.message.includes('smtp_auth_disabled')
      )) {
        return {
          success: false,
          error: "Microsoft has disabled SMTP Authentication for your tenant. Please visit https://aka.ms/smtp_auth_disabled for more information.",
          details: {
            errorCode: "SMTP_AUTH_DISABLED",
            microsoftError: verifyError.message,
            microsoftDocs: "https://aka.ms/smtp_auth_disabled"
          }
        };
      }
      
      // Add detailed information about the error for better diagnostics
      const errorDetails = {
        code: verifyError.code,
        command: verifyError.command,
        responseCode: verifyError.responseCode,
        response: verifyError.response,
        source: 'SMTP verification'
      };
      
      throw new Error(`SMTP verification failed: ${verifyError.message}. Details: ${JSON.stringify(errorDetails)}`);
    }
    
    // Send the email
    console.log("Sending email...");
    const info = await client.sendMail(params);
    console.log("Email sent successfully:", info);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error: any) {
    console.error("Error sending email:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    
    // Analyze the error to provide better diagnostics
    const details: any = {
      name: error.name,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    };
    
    // Enhanced Office 365 SMTP authentication disabled detection
    if (error.message && (
        error.message.includes('SmtpClientAuthentication is disabled') ||
        error.message.includes('SMTP Auth is disabled') ||
        error.message.includes('SMTP-AUTH') ||
        error.message.includes('smtp_auth_disabled')
    )) {
      return {
        success: false,
        error: "Microsoft has disabled SMTP Authentication for your tenant. Please visit https://aka.ms/smtp_auth_disabled for more information.",
        details: {
          errorCode: "SMTP_AUTH_DISABLED",
          microsoftError: error.message,
          microsoftDocs: "https://aka.ms/smtp_auth_disabled"
        }
      };
    }
    
    // OAuth2 related errors
    if (error.message && (
        error.message.includes('OAuth2') || 
        error.message.includes('auth') || 
        error.message.includes('authentication') ||
        error.code === 'EAUTH'
    )) {
      details.authProblem = true;
      details.suggestion = 'The OAuth2 token might be invalid or expired. Try re-authenticating with Microsoft.';
    }
    
    // Connection errors
    if (error.code === 'ECONNECTION' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ESOCKET') {
      details.connectionProblem = true;
      details.suggestion = 'There was a problem connecting to the mail server. Check server settings and network connectivity.';
    }
    
    return {
      success: false,
      error: error.message,
      details: details
    };
  }
}
