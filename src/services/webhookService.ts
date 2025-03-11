
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
    console.log('Fetching webhook settings from Supabase');
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching webhook settings:', error);
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('No webhook settings found');
        return null;
      }
      
      if (error.code === 'PGRST301') {
        // RLS policy error
        console.error('Row Level Security policy error. User may not have admin access to webhook settings.');
        toast({
          title: "Access Error",
          description: "You don't have permission to access webhook settings. Admin privileges required.",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Error",
        description: "Failed to fetch webhook settings: " + error.message,
        variant: "destructive",
      });
      return null;
    }
    
    console.log('Webhook settings fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchWebhookSettings:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while fetching webhook settings",
      variant: "destructive",
    });
    return null;
  }
};

export const updateWebhookSettings = async (url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    // If settings do not exist yet, create a new record
    if (!current?.id) {
      console.log('Creating new webhook settings record');
      const { error } = await supabase
        .from('webhook_settings')
        .insert([{ url, updated_at: new Date().toISOString() }]);
        
      if (error) {
        console.error('Error creating webhook settings:', error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Access Error",
            description: "You don't have permission to create webhook settings. Admin privileges required.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Error",
          description: "Failed to create webhook settings: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Webhook settings created successfully",
      });
      return true;
    }

    // Update existing settings
    const { error } = await supabase
      .from('webhook_settings')
      .update({ url, updated_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating webhook settings:', error);
      
      if (error.code === 'PGRST301') {
        toast({
          title: "Access Error",
          description: "You don't have permission to update webhook settings. Admin privileges required.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Error",
        description: "Failed to update webhook settings: " + error.message,
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
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating webhook settings",
      variant: "destructive",
    });
    return false;
  }
};

export const updateMyBusinessWebhookSettings = async (mybusiness_url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    // If settings do not exist yet, create a new record
    if (!current?.id) {
      console.log('Creating new webhook settings record with mybusiness_url');
      const { error } = await supabase
        .from('webhook_settings')
        .insert([{ mybusiness_url, updated_at: new Date().toISOString() }]);
        
      if (error) {
        console.error('Error creating My Business webhook settings:', error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Access Error",
            description: "You don't have permission to create My Business webhook settings. Admin privileges required.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Error",
          description: "Failed to create My Business webhook settings: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "My Business webhook settings created successfully",
      });
      return true;
    }

    // Update existing settings
    const { error } = await supabase
      .from('webhook_settings')
      .update({ mybusiness_url, updated_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating My Business webhook settings:', error);
      
      if (error.code === 'PGRST301') {
        toast({
          title: "Access Error",
          description: "You don't have permission to update My Business webhook settings. Admin privileges required.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Error",
        description: "Failed to update My Business webhook settings: " + error.message,
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
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating My Business webhook settings",
      variant: "destructive",
    });
    return false;
  }
};
