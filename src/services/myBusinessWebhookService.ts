
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
      throw new Error(`Webhook request failed: ${response.status} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error in callMyBusinessWebhook:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to call My Business webhook",
      variant: "destructive",
    });
    throw error;
  }
};
