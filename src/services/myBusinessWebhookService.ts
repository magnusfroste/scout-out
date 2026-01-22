
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const callMyBusinessWebhook = async (webhookUrl: string, websiteUrl: string) => {
  try {
    console.log(`Calling MyBusiness webhook via Edge Function`);
    console.log(`With website URL: ${websiteUrl}`);
    
    // Use supabase.functions.invoke which automatically handles the correct URL
    const { data, error } = await supabase.functions.invoke('trigger-mybusiness-webhook', {
      body: { website: websiteUrl }
    });
    
    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Service unavailable. Please try again later.');
    }
    
    console.log('Edge Function response data:', data);
    console.log('✅ METHOD USED: Edge Function via supabase.functions.invoke');
    
    // If the Edge Function returns a nested response, extract the actual data
    if (data?.success && data?.data) {
      console.log('Extracting nested data from Edge Function response');
      return new Response(JSON.stringify(data.data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // Return the data as a Response object
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in callMyBusinessWebhook:', error);
    throw error;
  }
};
