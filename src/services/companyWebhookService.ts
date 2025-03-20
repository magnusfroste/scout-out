
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
  business?: any;
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
  
  // Add any additional properties from customRequestBody, except for 'company' which should remain a string
  if (customRequestBody) {
    Object.entries(customRequestBody).forEach(([key, value]) => {
      if (key !== 'company' && key !== 'questions' && key !== 'userInfo') {
        requestBody[key] = value;
      }
    });
  }
  
  // Final check to ensure company is always a string
  if (typeof requestBody.company !== 'string') {
    console.warn("Fixing company format: company should be a string, not an object");
    requestBody.company = companyName;
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
