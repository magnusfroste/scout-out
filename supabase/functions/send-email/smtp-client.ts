
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

/**
 * Creates and configures an SMTP client with deliverability-optimized settings
 */
export function createSMTPClient(config: SMTPConfig): SMTPClient {
  const secure = config.port === 465;
  
  return new SMTPClient({
    connection: {
      hostname: config.host,
      port: config.port,
      tls: secure,
      auth: {
        username: config.email,
        password: config.password,
      },
    },
    pool: false,
    client: {
      // Add proper identification for better deliverability
      name: "Master Business Agent",
      version: "1.0.0",
      // Using a common domain for delivery authentication
      hostname: new URL(config.host).hostname || "localhost",
    },
  });
}

/**
 * Sends an email using the provided SMTP client and email parameters
 * Optimized for deliverability with proper headers and configuration
 */
export async function sendEmail(client: SMTPClient, params: EmailParams) {
  try {
    console.log("Starting email sending process");
    
    // Add proper email headers and structure for improved deliverability
    await client.send({
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
    
    console.log("Email sent successfully");
    await client.close();
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    try {
      await client.close();
    } catch (closeError) {
      console.error("Error closing SMTP client:", closeError);
    }
    throw error;
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
