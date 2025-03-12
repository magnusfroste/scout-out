
import { toast } from '@/hooks/use-toast';

export const callMyBusinessWebhook = async (webhookUrl: string, websiteUrl: string) => {
  try {
    console.log(`Calling MyBusiness webhook: ${webhookUrl}`);
    console.log(`With website URL: ${websiteUrl}`);
    
    // Send the website URL as a JSON object with a url property
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        url: websiteUrl 
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MyBusiness webhook error:', errorText);
      throw new Error(`Service unavailable. Please try again later.`);
    }
    
    return response;
  } catch (error) {
    console.error('Error in callMyBusinessWebhook:', error);
    // Let the calling component handle the toast to provide a better user experience
    throw error;
  }
};
