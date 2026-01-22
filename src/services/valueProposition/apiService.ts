
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
  console.log('Mock mode status:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
  
  // Use mock data in development if enabled
  if (USE_MOCK_DATA) {
    console.log('Using mock data for value proposition');
    return getMockValuePropositionResponse(companyData, businessData, additionalData, userInfo) as Promise<Response>;
  }
  
  try {
    // Create the request body
    const requestBody = { 
      company: companyData,
      business: businessData,
      additional: additionalData,
      user: userInfo
    };
    
    console.log(`Request body:`, requestBody);
    
    // Use supabase.functions.invoke which automatically handles the correct URL
    const { data, error } = await supabase.functions.invoke('trigger-value-proposition-webhook', {
      body: requestBody
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
      return {
        ok: true,
        json: () => Promise.resolve(data.data)
      } as Response;
    }
    
    // Return the data as a Response-like object
    return {
      ok: true,
      json: () => Promise.resolve(data)
    } as Response;
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
