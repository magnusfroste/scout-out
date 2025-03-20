
/**
 * Service to handle calling the company research webhook
 */

import { Question } from '@/types/company';

export interface WebhookRequestBody {
  company: string;
  questions?: {
    id: string;
    text: string;
  }[];
  user?: {
    first_name?: string;
    last_name?: string;
  };
  [key: string]: any;
}

/**
 * Call the company webhook with the company name and questions
 */
export const callCompanyWebhook = async (
  webhookUrl: string,
  companyName: string,
  questions: Question[],
  customRequestBody?: WebhookRequestBody
): Promise<Response> => {
  console.log("Calling company webhook with URL:", webhookUrl);
  
  // Build request body
  const requestBody: WebhookRequestBody = customRequestBody || {
    company: companyName,
    questions: questions.map(q => ({
      id: q.id,
      text: q.question
    }))
  };
  
  // If customRequestBody is provided, ensure user data is at the top level if present
  if (customRequestBody && customRequestBody.user) {
    requestBody.user = customRequestBody.user;
  }
  
  // Log the request body
  console.log("Webhook request body:", JSON.stringify(requestBody, null, 2));
  
  // Make the API call
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  return response;
};
