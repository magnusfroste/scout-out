
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Check if we're in mock mode from environment variable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;

// Mock response for testing in development
const getMockValuePropositionResponse = (companyData: any, businessData: any) => {
  console.log('MOCK MODE: Generating mock value proposition data');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({
          score: Math.floor(Math.random() * 5) + 1, // Random score between 1-5
          advice: `Based on our analysis, ${companyData.company_name} would be a great fit for your business. Their ${companyData.result?.industry || 'business'} aligns well with your products and services. We recommend highlighting your experience in this sector.`,
          introduction: `Hello ${companyData.contact || 'there'},\n\nI'm reaching out from ${businessData?.name || 'our company'} where we specialize in ${businessData?.description || 'our services'}. I recently came across ${companyData.company_name} and was impressed by your work in ${companyData.result?.industry || 'your industry'}.\n\nI believe we could help you with ${businessData?.value_proposition || 'improving your business'}.\n\nWould you be open to a brief conversation next week to explore potential synergies?\n\nBest regards,\n${businessData?.contact_name || 'Your Name'}`
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
  businessData: any
): Promise<Response> => {
  console.log('Calling value proposition webhook');
  console.log('Company data:', companyData);
  console.log('Business data:', businessData);
  console.log('Using webhook URL:', webhookUrl);
  console.log('Mock mode status:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
  
  // Create the actual request body as it will be sent to the API
  const requestBody = { 
    company: companyData,
    business: businessData
  };
  
  // Log the exact JSON payload that will be sent to the API
  console.log('WEBHOOK REQUEST PAYLOAD:', JSON.stringify(requestBody, null, 2));
  
  // Use mock data if in development mode and mock flag is enabled
  if (USE_MOCK_DATA) {
    console.log('MOCK MODE ACTIVE: Using mock data for value proposition');
    return getMockValuePropositionResponse(companyData, businessData) as Promise<Response>;
  }
  
  // Otherwise make the actual API call
  console.log('LIVE MODE: Making actual API call to webhook');
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Webhook response status:', response.status);
    // Check if response status is OK before returning
    if (!response.ok) {
      console.error('Webhook response not OK:', response.status, response.statusText);
      // We'll still return the response so the caller can handle it
    }
    return response;
  } catch (error) {
    console.error('Error in webhook call:', error);
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
  introduction: string | null
): Promise<boolean> => {
  try {
    console.log('Saving value proposition data to database for search ID:', searchId);
    console.log('Data to save:', { score, advice, introduction });
    
    // First verify the search exists and the current user has permission
    const { data: checkData, error: checkError } = await supabase
      .from('company_searches')
      .select('id, user_id')
      .eq('id', searchId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error verifying search existence:', checkError);
      throw new Error(`Could not verify search exists: ${checkError.message}`);
    }
    
    if (!checkData) {
      console.error('Search not found or user does not have permission to update it');
      throw new Error('Search not found or you do not have permission to update it');
    }
    
    console.log('Search verified, proceeding with update');

    // Update the company search record
    const { data, error } = await supabase
      .from('company_searches')
      .update({
        score: score,
        advice: advice,
        introduction: introduction
      })
      .eq('id', searchId)
      .select();

    if (error) {
      console.error('Error updating value proposition data:', error);
      throw error;
    }
    
    console.log('Database update response:', data);
    
    if (!data || data.length === 0) {
      console.error('Update operation did not affect any rows');
      throw new Error('Update operation did not affect any rows');
    }
    
    console.log('Successfully saved value proposition data for search ID:', searchId);
    return true;
  } catch (error) {
    console.error('Error in saveValuePropositionData:', error);
    throw error;
  }
};
