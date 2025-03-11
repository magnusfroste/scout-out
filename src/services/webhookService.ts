
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WebhookSettings {
  id: string;
  url: string;
  mybusiness_url: string;
  created_at: string;
  updated_at: string;
}

export const fetchWebhookSettings = async (): Promise<WebhookSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching webhook settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchWebhookSettings:', error);
    return null;
  }
};

export const updateWebhookSettings = async (url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    if (!current?.id) {
      toast({
        title: "Error",
        description: "Could not find webhook settings to update",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('webhook_settings')
      .update({ url, updated_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating webhook settings:', error);
      toast({
        title: "Error",
        description: "Failed to update webhook settings",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Webhook settings updated successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in updateWebhookSettings:', error);
    return false;
  }
};

export const updateMyBusinessWebhookSettings = async (mybusiness_url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    if (!current?.id) {
      toast({
        title: "Error",
        description: "Could not find webhook settings to update",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('webhook_settings')
      .update({ mybusiness_url, updated_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating My Business webhook settings:', error);
      toast({
        title: "Error",
        description: "Failed to update My Business webhook settings",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "My Business webhook settings updated successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in updateMyBusinessWebhookSettings:', error);
    return false;
  }
};
