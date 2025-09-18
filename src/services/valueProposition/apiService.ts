
import { supabase } from '@/integrations/supabase/client';
import { USE_MOCK_DATA, getMockValuePropositionResponse } from './mockUtils';

/**
 * Calls the webhook to generate value proposition content
 */
export const callValuePropositionWebhook = async (
  webhookUrl: string,
  companyData: any,
  businessData: any,
  additionalData: any = null,
  userInfo: any = null
): Promise<Response> => {
  console.log('Calling value proposition webhook');
  console.log('Company data:', companyData);
  console.log('Business data:', businessData);
  console.log('Additional data:', additionalData);
  console.log('User info:', userInfo);
  console.log('Original webhook URL (for reference only):', webhookUrl);
  console.log('Mock mode status:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
  
  // Use mock data in development if enabled
  if (USE_MOCK_DATA) {
    console.log('Using mock data for value proposition');
    return getMockValuePropositionResponse(companyData, businessData, additionalData, userInfo) as Promise<Response>;
  }
  
  try {
    // Get the current user's session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    // Call the Edge Function instead of the webhook directly
    const edgeFunctionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-value-proposition-webhook';
    console.log(`Calling Edge Function URL: ${edgeFunctionUrl}`);
    
    // Create the request body
    const requestBody = { 
      company: companyData,
      business: businessData,
      additional: additionalData,
      user: userInfo
    };
    
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
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        console.error('Value proposition webhook error response:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.details) {
          console.error('Error details:', errorData.details);
          errorDetails = errorData.details;
        }
        
        // If the Edge Function couldn't reach the webhook, try direct call as fallback
        if (errorData.message && errorData.message.includes('error sending request for url')) {
          console.log('⚠️ Edge Function could not reach webhook. Attempting direct call as fallback...');
          
          // Make a direct call to the webhook as a fallback
          const directResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (directResponse.ok) {
            console.log('✅ METHOD USED: Direct webhook call (fallback)');
            return directResponse;
          } else {
            console.error('Direct webhook call also failed:', await directResponse.text());
          }
        }
      } catch (e) {
        const errorText = await response.text();
        console.error('Value proposition webhook error (text):', errorText);
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
    console.error('Error in callValuePropositionWebhook:', error);
    throw error;
  }
};

/**
 * Get the webhook URL from settings - now managed via secrets
 */
export const getValuePropositionWebhookUrl = async (): Promise<string | null> => {
  // Value proposition webhook URL is now managed via VALUE_PROPOSITION_WEBHOOK_URL secret
  console.log('Value proposition webhook URL is now managed via secrets in edge functions');
  return null;
};
