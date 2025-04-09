// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Using a more reliable email library for Deno
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailData {
  recipient: string;
  subject: string;
  content: string;
  senderName: string;
}

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    console.log("Received email send request");
    
    // Get request data
    const { emailData, userId } = await req.json();
    
    console.log("Request data:", { emailDataReceived: !!emailData, userIdReceived: !!userId });
    
    // Validate input
    if (!emailData || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required data' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    // Create authenticated Supabase client using the request's authorization header
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Anon Key available:", !!supabaseAnonKey);
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: { headers: { Authorization: authHeader || '' } },
      }
    );
    
    // Get user's email settings
    console.log("Fetching email settings for user:", userId);
    
    const { data: settings, error } = await supabaseClient
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error("Error fetching email settings:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email settings error: ${error.message}` 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }
    
    if (!settings) {
      console.error("No email settings found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email settings not found' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }
    
    console.log("Email settings found:", {
      provider: settings.email_provider,
      host: settings.smtp_host,
      port: settings.smtp_port,
      email: settings.email_address
    });
    
    try {
      // Configure email client using denomailer
      console.log("Configuring email client");
      
      // Determine secure connection based on port
      const secure = settings.smtp_port === 465;
      console.log(`Using ${secure ? 'secure' : 'non-secure'} connection`);
      
      const client = new SMTPClient({
        connection: {
          hostname: settings.smtp_host,
          port: settings.smtp_port,
          tls: secure,
          auth: {
            username: settings.email_address,
            password: settings.app_password,
          },
        },
      });
      
      // Send email
      console.log("Sending email to:", emailData.recipient);
      
      await client.send({
        from: settings.email_address,
        to: emailData.recipient,
        subject: emailData.subject || `Introduction from ${emailData.senderName}`,
        content: emailData.content,
        html: emailData.content.replace(/\n/g, '<br>'),
        headers: {
          "Reply-To": settings.email_address,
          "X-Priority": "3",
          "List-Unsubscribe": `<mailto:${settings.email_address}?subject=Unsubscribe>`,
          "X-Mailer": "Master Business Agent",
          "Precedence": "bulk",
          "Message-ID": `<${Date.now()}.${Math.random().toString(36).substring(2)}@${settings.smtp_host}>`,
          "MIME-Version": "1.0"
        }
      });
      
      console.log("Email sent successfully");
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
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
            host: settings.smtp_host,
            port: settings.smtp_port,
            errorType: smtpError.name,
            errorStack: smtpError.stack
          }
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }
  } catch (error) {
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
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"emailData":{"recipient":"test@example.com","subject":"Introduction","content":"Hello!","senderName":"My Business"},"userId":"your-user-id"}'

*/
