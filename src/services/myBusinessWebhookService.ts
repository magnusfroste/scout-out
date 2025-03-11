
import { supabase } from '@/integrations/supabase/client';

/**
 * Calls the my-business webhook with the given website URL
 */
export const callMyBusinessWebhook = async (webhookUrl: string, website: string) => {
  try {
    // Define structured schema for consistent output
    const structuredSchema = {
      company_name: "String - Company name extracted from the website",
      tagline: "String - Short tagline or slogan",
      about_us: "String - About us section extracted from the website",
      services: [
        {
          name: "String - Name of the service",
          description: "String - Description of the service"
        }
      ],
      value_clients_experience: "String - What value clients get from the company's services",
      clients: ["String - List of client names mentioned on the website"],
      client_testimonials: [
        {
          name: "String - Name of the client giving testimonial",
          position: "String - Job title or position",
          company: "String - Company name",
          quote: "String - The testimonial text"
        }
      ],
      call_to_action: "String - Call to action text found on the website"
    };

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('trigger-n8n-workflow', {
      body: {
        website,
        webhookUrl,
        structuredSchema
      }
    });

    if (error) {
      console.error('Error calling webhook:', error);
      throw new Error(error.message);
    }

    // Create a Response object from the data
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: data.success ? 200 : 500
    });
  } catch (error) {
    console.error('Error calling my business webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
};
