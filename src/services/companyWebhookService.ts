
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
  userInfo?: {
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
  const requestBody: WebhookRequestBody = {
    company: companyName,
    questions: questions.map(q => ({
      id: q.id,
      text: q.question
    }))
  };
  
  // Add userInfo from customRequestBody if it exists
  if (customRequestBody?.userInfo) {
    requestBody.userInfo = customRequestBody.userInfo;
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
