import { Answer } from '@/utils/webhookResponseParser';
import { Question } from '@/types/company';
import { getMockResponse, getMockErrorResponse } from '@/mocks/companySearchMock';

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
  console.log('Using webhook URL:', webhookUrl);
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
  
  // Otherwise make the actual API call
  console.log('LIVE MODE: Making actual API call to webhook');
  return fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      company: companyName, 
      questions: questions.map(q => ({
        id: q.id,
        question: q.question
      }))
    })
  });
};
