
import { ElevatorPitch } from '@/utils/webhookResponseParser';

/**
 * Calls the webhook endpoint with business website data
 */
export const callMyBusinessWebhook = async (
  webhookUrl: string,
  websiteUrl: string
): Promise<Response> => {
  console.log('Calling my business webhook:', webhookUrl);
  console.log('With website URL:', websiteUrl);
  
  return fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      website: websiteUrl
    })
  });
};
