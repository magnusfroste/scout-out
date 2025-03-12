
import { Answer } from '@/utils/webhookResponseParser';
import { Question } from '@/types/company';

/**
 * Calls the webhook endpoint with company search data
 */
export const callCompanyWebhook = async (
  webhookUrl: string,
  companyName: string,
  questions: Question[]
): Promise<Response> => {
  console.log('Calling webhook with URL:', webhookUrl);
  console.log('Company name:', companyName);
  console.log('Questions:', JSON.stringify(questions));
  
  const payload = { 
    company: companyName, 
    questions: questions.map(q => ({
      id: q.id,
      question: q.question
    }))
  };
  
  console.log('Webhook payload:', JSON.stringify(payload));
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Webhook response status:', response.status);
    if (!response.ok) {
      console.error('Webhook error status:', response.status);
      const text = await response.text();
      console.error('Webhook error body:', text);
    }
    
    return response;
  } catch (error) {
    console.error('Error calling webhook:', error);
    throw error;
  }
};
