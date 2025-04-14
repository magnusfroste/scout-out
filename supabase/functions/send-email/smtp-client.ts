
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
  content: string;
  html: string;
  headers?: Record<string, string>;
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
    debug: true, // Enable debug mode for more logs
  });
}

/**
 * Sends an email using the provided SMTP client and email parameters
 */
export async function sendEmail(client: SMTPClient, params: EmailParams) {
  try {
    const result = await client.send(params);
    console.log("Email sent successfully:", result);
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
