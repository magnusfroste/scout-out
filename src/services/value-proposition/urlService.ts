
import { supabase } from '@/integrations/supabase/client';

/**
 * Get the webhook URL from settings
 */
export const getValuePropositionWebhookUrl = async (): Promise<string | null> => {
  try {
    console.log('Fetching value proposition webhook URL from settings');
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('value_proposition_url')
      .single();
      
    if (error) {
      console.error('Error fetching value proposition webhook URL:', error);
      return null;
    }
    
    console.log('Retrieved webhook URL:', data?.value_proposition_url);
    return data?.value_proposition_url || null;
  } catch (error) {
    console.error('Error in getValuePropositionWebhookUrl:', error);
    return null;
  }
};
