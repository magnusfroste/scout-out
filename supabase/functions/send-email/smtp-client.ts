
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

export interface SMTPConfig {
  host: string;
  port: number;
  email: string;
  password: string;
}

export interface EmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * Creates and configures an SMTP client with deliverability-optimized settings
 */
export function createSMTPClient(config: SMTPConfig): SMTPClient {
  // For gmail with port 587, we need to explicitly set secure to false and use STARTTLS
  const secure = config.port === 465;
  
  try {
    console.log(`Creating SMTP client for host: ${config.host}, port: ${config.port}, email: ${config.email}, secure: ${secure}`);
    
    if (!config.host || !config.port || !config.email || !config.password) {
      throw new Error("Missing required SMTP configuration parameters");
    }
    
    // Log password length but not the actual password
    console.log(`Password provided with length: ${config.password.length}`);
    
    // Log the actual configuration being used (without password)
    console.log(`SMTP Configuration: ${JSON.stringify({
      hostname: config.host,
      port: config.port,
      tls: secure,
      starttls: config.port === 587,
      username: config.email
    }, null, 2)}`);
    
    // FIXED: Removed the new URL() that was causing the error
    return new SMTPClient({
      connection: {
        hostname: config.host,
        port: config.port,
        tls: secure,
        // For Gmail port 587, need to use STARTTLS
        starttls: config.port === 587,
        auth: {
          username: config.email,
          password: config.password,
        },
      },
      // Set pool to false to create a new connection each time for better error handling
      pool: false,
      client: {
        // Add proper identification for better deliverability
        name: "Master Business Agent",
        version: "1.0.0",
        // Using a static valid domain instead of trying to parse the host
        hostname: "localhost",
      },
    });
  } catch (error) {
    console.error("Error creating SMTP client:", error);
    throw new Error(`Failed to create SMTP client: ${error.message}`);
  }
}

/**
 * Sends an email using the provided SMTP client and email parameters
 * Optimized for deliverability with proper headers and configuration
 */
export async function sendEmail(client: SMTPClient, params: EmailParams): Promise<EmailResult> {
  try {
    console.log("Starting email sending process with parameters:", {
      from: params.from,
      to: params.to,
      subject: params.subject,
    });
    
    // Add proper email headers and structure for improved deliverability
    const result = await client.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      headers: {
        // Add proper headers to reduce spam scoring
        "X-Mailer": "Master Business Agent",
        "X-Priority": "3", // Normal priority
        "Precedence": "Bulk",
        "List-Unsubscribe": `<mailto:${params.from}?subject=Unsubscribe>`,
      },
      // Important: Add plain text alternative to improve deliverability
      text: htmlToPlainText(params.html),
    });
    
    console.log("Email sent successfully with transaction ID:", result?.id || "unknown");
    await client.close();
    return { success: true };
  } catch (error: any) {
    // Log detailed error information to help diagnose the issue
    console.error("Error sending email:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      response: error.response || "No response info",
      commandQueue: error.commandQueue || "No command queue info",
      lastCommand: error.lastCommand || "No last command info"
    });
    
    try {
      await client.close();
    } catch (closeError) {
      console.error("Error closing SMTP client:", closeError);
    }
    
    return { 
      success: false, 
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        info: error.response || error.info || "No additional information"
      }
    };
  }
}

/**
 * Convert HTML content to plain text for improved deliverability
 * Having both HTML and plain text versions significantly improves spam scores
 */
function htmlToPlainText(html: string): string {
  // Basic conversion of HTML to plain text
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove style tags and their content
    .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove script tags and their content
    .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with regular spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n\n') // Remove extra blank lines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim(); // Trim leading/trailing whitespace
}
