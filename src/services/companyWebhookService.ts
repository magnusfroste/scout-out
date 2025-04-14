import { Answer } from '@/types/company';
import { Question } from '@/types/company';
import { getMockResponse, getMockErrorResponse } from '@/mocks/companySearchMock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Check if we're in mock mode from environment variable
// In production, we should NEVER use mock data regardless of the environment variable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;

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
  console.log('Calling webhook with company:', companyName);
  console.log('Calling webhook with questions:', JSON.stringify(questions));
  console.log('Using webhook URL (for reference only):', webhookUrl);
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
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    // Call the Edge Function instead of the webhook directly
    const edgeFunctionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-questions-webhook';
    console.log(`Calling Edge Function URL: ${edgeFunctionUrl}`);
    
    // Create the request body
    const requestBody = { 
      company: companyName, 
      questions: questions.map(q => ({
        id: q.id,
        question: q.question
      }))
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
      try {
        const errorData = await response.json();
        console.error('Questions webhook error response:', errorData);
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
              body: JSON.stringify(requestBody)
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
        console.error('Questions webhook error (text):', errorText);
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
    console.error('Error in callCompanyWebhook:', error);
    throw error;
  }
};
