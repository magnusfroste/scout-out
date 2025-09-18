
import { Answer } from '@/utils/webhookResponseParser';
import { Question } from '@/types/company';
import { getMockResponse, getMockErrorResponse } from '@/mocks/companySearchMock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;

// Log the environment configuration
console.log('Webhook Service Configuration:', { 
  isDev: import.meta.env.DEV,
  useMockData: USE_MOCK_DATA,
  mockDataEnv: import.meta.env.VITE_USE_MOCK_DATA,
  mockDataType: typeof import.meta.env.VITE_USE_MOCK_DATA,
  mode: import.meta.env.MODE
});

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
  
  if (USE_MOCK_DATA) {
    console.log('MOCK MODE ACTIVE: Using mock data for company search');
    if (companyName.toLowerCase().includes('error')) {
      console.log('MOCK MODE: Simulating error response for company containing "error"');
      return getMockErrorResponse();
    }
    console.log('MOCK MODE: Returning mock data for company:', companyName);
    return getMockResponse(companyName);
  }
  
  try {
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

    console.log('📡 Calling company research edge function');
    const { data, error } = await supabase.functions.invoke('trigger-company-research-webhook', {
      body: {
        company: companyName,
        questions: questions
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(error.message || 'Failed to call company research webhook');
    }

    console.log('✅ Edge function response received');
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in callCompanyWebhook:', error);
    throw error;
  }
};

export const getCompanyWebhookUrl = async (): Promise<string> => {
  try {
    console.log('Fetching company research webhook URL from settings');
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching company research webhook URL:', error);
      // Return empty string if there's an error
      return '';
    }
    
    // We use 'url' for step 3 (company research)
    const webhookUrl = data?.url || '';
    console.log('Retrieved company research webhook URL:', webhookUrl);
    return webhookUrl;
  } catch (error) {
    console.error('Error in getCompanyWebhookUrl:', error);
    return '';
  }
};
