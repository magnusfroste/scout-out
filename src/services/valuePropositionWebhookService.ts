import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  // Use mock data if in development mode and mock flag is enabled
  if (USE_MOCK_DATA) {
    console.log('MOCK MODE ACTIVE: Using mock data for value proposition');
    return getMockValuePropositionResponse(companyData, businessData) as Promise<Response>;
  }
  
  // Otherwise make the actual API call
  console.log('LIVE MODE: Making actual API call to webhook');
  return fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      company: companyData,
      business: businessData
    })
  });
};

/**
 * Get the webhook URL from settings
 */
export const getValuePropositionWebhookUrl = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('url')
      .single();
      
    if (error) {
      console.error('Error fetching webhook URL:', error);
      return null;
    }
    
    return data?.url || null;
  } catch (error) {
    console.error('Error in getValuePropositionWebhookUrl:', error);
    return null;
  }
};
