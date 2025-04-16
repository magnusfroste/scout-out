
import { Answer } from '@/utils/webhookResponseParser';
import { Question } from '@/types/company';
import { getMockResponse, getMockErrorResponse } from '@/mocks/companySearchMock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Check if we're in mock mode from environment variable
// In production, we should NEVER use mock data regardless of the environment variable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;

// Default company research webhook URL as fallback - this is specific to Step 3
const DEFAULT_COMPANY_WEBHOOK_URL = 'https://agent.froste.eu/webhook/company';

// Log the environment configuration
console.log('Webhook Service Configuration:', { 
  isDev: import.meta.env.DEV,
  useMockData: USE_MOCK_DATA,
  mockDataEnv: import.meta.env.VITE_USE_MOCK_DATA,
  mockDataType: typeof import.meta.env.VITE_USE_MOCK_DATA,
  mode: import.meta.env.MODE
});

/**
 * Calls the webhook endpoint with company search data
 * Uses mock data if VITE_USE_MOCK_DATA is set to 'true' AND we're in development mode
 */
export const callCompanyWebhook = async (
  webhookUrl: string,
  companyName: string,
  questions: Question[]
): Promise<Response> => {
  console.log('▶️ WEBHOOK CALL INITIATED');
  console.log('Company:', companyName);
  console.log('Questions count:', questions.length);
  console.log('Questions:', JSON.stringify(questions, null, 2));
  console.log('Webhook URL:', webhookUrl);
  console.log('Mock mode status:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
  console.log('Environment mode:', import.meta.env.MODE);
  
  // Use mock data ONLY if in development mode AND mock flag is enabled
  if (USE_MOCK_DATA) {
    console.log('MOCK MODE ACTIVE: Using mock data for company search');
    
    // Simulate error response if company name contains "error" for testing error handling
    if (companyName.toLowerCase().includes('error')) {
      console.log('MOCK MODE: Simulating error response for company containing "error"');
      return getMockErrorResponse();
    }
    
    // Return mock response for normal operation
    console.log('MOCK MODE: Returning mock data for company:', companyName);
    return getMockResponse(companyName);
  }
  
  try {
    // Get the current user's session token for authentication
    console.log('🔐 Getting auth session token');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    const accessToken = sessionData?.session?.access_token;
    console.log('Access token available:', !!accessToken);
    
    if (!accessToken) {
      console.error('❌ No access token available');
      throw new Error('Authentication required. Please sign in again.');
    }
    
    // Make a direct call to the webhook
    console.log(`📡 Calling webhook directly: ${webhookUrl}`);
    
    // Create the request body
    const requestBody = { 
      company: companyName, 
      questions: questions.map(q => ({
        id: q.id,
        question: q.question
      }))
    };
    
    console.log(`📦 Request body:`, JSON.stringify(requestBody, null, 2));
    
    console.log('🚀 Sending request to webhook');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Client-Info': 'Lovable Web App'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 Webhook response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ Webhook error status: ${response.status}`);
      let errorMessage = 'Service unavailable. Please try again later.';
      try {
        const errorData = await response.json();
        console.error('Company webhook error response:', errorData);
        if (errorData.message) {
          errorMessage = errorData.message;
          console.error('Error message:', errorData.message);
        }
      } catch (e) {
        const errorText = await response.text();
        console.error('Company webhook error (text):', errorText);
      }
      throw new Error(errorMessage);
    }
    
    // Check if the response has the expected format
    console.log('👍 Webhook response received, parsing data');
    const responseData = await response.json();
    console.log('Webhook response data:', responseData);
    console.log('✅ METHOD USED: Direct webhook call');
    
    // Return the response
    return {
      ok: true,
      json: () => Promise.resolve(responseData)
    } as Response;
  } catch (error) {
    console.error('❌ Error in callCompanyWebhook:', error);
    throw error;
  }
};

/**
 * Get the webhook URL for company research (Step 3)
 */
export const getCompanyWebhookUrl = async (): Promise<string> => {
  try {
    console.log('Fetching company research webhook URL from settings');
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching company research webhook URL:', error);
      return DEFAULT_COMPANY_WEBHOOK_URL;
    }
    
    // We now use 'url' for step 3 (company research)
    const webhookUrl = data?.url || DEFAULT_COMPANY_WEBHOOK_URL;
    console.log('Retrieved company research webhook URL:', webhookUrl);
    return webhookUrl;
  } catch (error) {
    console.error('Error in getCompanyWebhookUrl:', error);
    return DEFAULT_COMPANY_WEBHOOK_URL;
  }
};
