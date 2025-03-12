
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
    console.log('Starting webhook request...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Webhook response status:', response.status);
    console.log('Webhook response headers:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      console.error('Webhook error status:', response.status);
      const text = await response.text();
      console.error('Webhook error body:', text);
    } else {
      console.log('Webhook successful');
      // Clone response before consuming it
      const clonedResponse = response.clone();
      try {
        const responseData = await clonedResponse.json();
        console.log('Webhook response data preview:', 
          JSON.stringify(responseData).substring(0, 200) + '...');
      } catch (e) {
        console.log('Could not preview response JSON');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error calling webhook:', error);
    throw error;
  }
};
