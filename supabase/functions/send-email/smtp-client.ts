
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
    pool: false,
  });
}

/**
 * Sends an email using the provided SMTP client and email parameters
 */
export async function sendEmail(client: SMTPClient, params: EmailParams) {
  try {
    console.log("Starting email sending process");
    
    await client.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
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
