
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
