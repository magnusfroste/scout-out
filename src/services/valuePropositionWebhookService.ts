import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Check if we're in mock mode from environment variable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;

// Mock response for testing in development
const getMockValuePropositionResponse = (companyData: any, businessData: any, additionalData: any, userInfo: any) => {
  console.log('MOCK MODE: Generating mock value proposition data');
  console.log('Additional data:', additionalData);
  console.log('User info:', userInfo);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({
          score: Math.floor(Math.random() * 5) + 1, // Random score between 1-5
          advice: `Based on our analysis, ${companyData.company_name} would be a great fit for your business. Their ${companyData.result?.industry || 'business'} aligns well with your products and services. We recommend highlighting your experience in this sector.`,
          introduction: `Hello ${companyData.contact || 'there'},\n\nI'm reaching out from ${businessData?.name || 'our company'} where we specialize in ${businessData?.description || 'our services'}. I recently came across ${companyData.company_name} and was impressed by your work in ${companyData.result?.industry || 'your industry'}.\n\nI believe we could help you with ${businessData?.value_proposition || 'improving your business'}.\n\nWould you be open to a brief conversation next week to explore potential synergies?\n\nBest regards,\n${userInfo?.first_name || 'Your Name'} ${userInfo?.last_name || ''}`,
          subject: `Introduction from ${businessData?.name || 'our company'}`
        })
      });
    }, 1500);
  });
};

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
 * Get the webhook URL from settings
 */
export const getValuePropositionWebhookUrl = async (): Promise<string | null> => {
  try {
    console.log('Fetching value proposition webhook URL from settings');
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('value_proposition_url')
      .single();
      
    if (error) {
      console.error('Error fetching value proposition webhook URL:', error);
      return null;
    }
    
    console.log('Retrieved webhook URL:', data?.value_proposition_url);
    return data?.value_proposition_url || null;
  } catch (error) {
    console.error('Error in getValuePropositionWebhookUrl:', error);
    return null;
  }
};

/**
 * Saves value proposition data to the database
 */
export const saveValuePropositionData = async (
  searchId: string,
  score: number | null,
  advice: string | null,
  introduction: string | null,
  subject: string | null
): Promise<boolean> => {
  try {
    console.log('Saving value proposition data for search:', searchId);
    
    const { error } = await supabase
      .from('company_searches')
      .update({
        score,
        advice,
        introduction,
        subject,
        updated_at: new Date().toISOString()
      })
      .eq('id', searchId);
      
    if (error) {
      console.error('Error saving value proposition data:', error);
      return false;
    }
    
    console.log('Value proposition data saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveValuePropositionData:', error);
    return false;
  }
};
