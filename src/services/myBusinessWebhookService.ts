import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const callMyBusinessWebhook = async (webhookUrl: string, websiteUrl: string) => {
  try {
    console.log(`Calling MyBusiness webhook via Edge Function`);
    console.log(`Original webhook URL (for reference only): ${webhookUrl}`);
    console.log(`With website URL: ${websiteUrl}`);
    
    // Get the current user's session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    // Call the Edge Function instead of the webhook directly
    const edgeFunctionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-mybusiness-webhook';
    console.log(`Calling Edge Function URL: ${edgeFunctionUrl}`);
    
    const requestBody = { website: websiteUrl };
    console.log(`Request body:`, requestBody);
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Edge Function response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = 'Service unavailable. Please try again later.';
      try {
        const errorData = await response.json();
        console.error('MyBusiness webhook error response:', errorData);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.details) {
          console.error('Error details:', errorData.details);
          
          // If the Edge Function couldn't reach the webhook, try direct call as fallback
          if (errorData.message && errorData.message.includes('error sending request for url')) {
            console.log('⚠️ Edge Function could not reach webhook. Attempting direct call as fallback...');
            
            // Make a direct call to the webhook as a fallback
            const directResponse = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: websiteUrl })
            });
            
            if (directResponse.ok) {
              console.log('✅ METHOD USED: Direct webhook call (fallback)');
              return directResponse;
            } else {
              console.error('Direct webhook call also failed:', await directResponse.text());
            }
          }
        }
      } catch (e) {
        const errorText = await response.text();
        console.error('MyBusiness webhook error (text):', errorText);
      }
      throw new Error(errorMessage);
    }
    
    // Check if the response has the expected format
    const responseData = await response.json();
    console.log('Edge Function response data:', responseData);
    console.log('✅ METHOD USED: Edge Function');
    
    // If the Edge Function returns a nested response, extract the actual data
    if (responseData.success && responseData.data) {
      console.log('Extracting nested data from Edge Function response');
      // Return the nested data directly instead of creating a new Response
      return {
        ok: true,
        json: () => Promise.resolve(responseData.data)
      } as Response;
    }
    
    // If the response doesn't have the expected format, return it as is
    return response;
  } catch (error) {
    console.error('Error in callMyBusinessWebhook:', error);
    // Let the calling component handle the toast to provide a better user experience
    throw error;
  }
};
