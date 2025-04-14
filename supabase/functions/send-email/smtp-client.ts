
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
 * Creates and configures an SMTP client with the provided settings
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
    debug: false, // Disable verbose logging for production
  });
}

/**
 * Sends an email using the provided SMTP client and email parameters
 */
export async function sendEmail(client: SMTPClient, params: EmailParams) {
  try {
    console.log("Starting email sending process");
    
    // Create a clean email structure
    const email = {
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "MIME-Version": "1.0",
        "Reply-To": params.from
      }
    };
    
    console.log("Sending email with clean configuration");
    
    const result = await client.send(email);
    console.log("Email sent successfully");
    await client.close();
    return result;
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
