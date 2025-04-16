import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WebhookSettings {
  id?: string;
  url?: string;
  mybusiness_url?: string;
  value_proposition_url?: string;
  company_research_url?: string;
  default_signup_credits?: number;
}

export const fetchWebhookSettings = async (): Promise<WebhookSettings | null> => {
  try {
    console.log('Fetching webhook settings from Supabase');
    
    // First check if the user has admin privileges
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return null;
    }
    
    if (!userData.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Get the user's profile to check admin status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    // Non-admin users should still fetch webhook settings but without showing error toasts
    if (!profileData.is_admin) {
      console.log('User is not an admin, fetching webhook settings silently');
      
      // Fetch the webhook settings without showing any toasts
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching webhook settings for non-admin:', error);
        return null;
      }
      
      // Ensure the returned data has all required fields and log the default_signup_credits
      if (data) {
        console.log('Webhook settings found for non-admin, default_signup_credits:', data.default_signup_credits);
        
        const webhookSettings: WebhookSettings = {
          ...data,
          questions_url: (data as any).questions_url || '',
          value_proposition_url: (data as any).value_proposition_url || '',
          default_signup_credits: data.default_signup_credits !== null ? data.default_signup_credits : 50
        };
        return webhookSettings;
      }
      
      return null;
    }
    
    // Now fetch the webhook settings for admin users
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching webhook settings:', error);
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('No webhook settings found, will create new settings');
        return null;
      }
      
      // Only show toast for admin users
      toast({
        title: "Error",
        description: "Failed to fetch webhook settings: " + error.message,
        variant: "destructive",
      });
      return null;
    }
    
    console.log('Webhook settings fetched successfully:', data);
    console.log('Default signup credits from settings:', data.default_signup_credits);
    
    // Ensure the returned data has all required fields
    if (data) {
      const webhookSettings: WebhookSettings = {
        ...data,
        questions_url: (data as any).questions_url || '',
        value_proposition_url: (data as any).value_proposition_url || '',
        default_signup_credits: data.default_signup_credits !== null ? data.default_signup_credits : 50
      };
      return webhookSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchWebhookSettings:', error);
    
    // Only show toast for admin users - we check this inside the function
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
        
      if (profileData?.is_admin) {
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching webhook settings",
          variant: "destructive",
        });
      }
    }
    
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
        .insert([{ 
          url, 
          mybusiness_url: '',
          questions_url: '',
          updated_at: new Date().toISOString() 
        }]);
        
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
      .update({ 
        url, 
        updated_at: new Date().toISOString() 
      })
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
        .insert([{ 
          url: current?.url || '',
          mybusiness_url, 
          questions_url: current?.questions_url || '',
          updated_at: new Date().toISOString() 
        }]);
        
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
      .update({ 
        mybusiness_url, 
        updated_at: new Date().toISOString() 
      })
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

export const updateQuestionsWebhookSettings = async (questions_url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    // If settings do not exist yet, create a new record
    if (!current?.id) {
      console.log('Creating new webhook settings record with questions_url');
      const { error } = await supabase
        .from('webhook_settings')
        .insert([{ 
          url: '',
          mybusiness_url: '',
          questions_url, 
          updated_at: new Date().toISOString() 
        }]);
        
      if (error) {
        console.error('Error creating questions webhook settings:', error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Access Error",
            description: "You don't have permission to create questions webhook settings. Admin privileges required.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Error",
          description: "Failed to create questions webhook settings: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Questions webhook settings created successfully",
      });
      return true;
    }

    // Update existing settings
    const { error } = await supabase
      .from('webhook_settings')
      .update({ 
        questions_url, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating questions webhook settings:', error);
      
      if (error.code === 'PGRST301') {
        toast({
          title: "Access Error",
          description: "You don't have permission to update questions webhook settings. Admin privileges required.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Error",
        description: "Failed to update questions webhook settings: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Questions webhook settings updated successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in updateQuestionsWebhookSettings:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating questions webhook settings",
      variant: "destructive",
    });
    return false;
  }
};

export const updateDefaultSignupCredits = async (default_signup_credits: number): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    // If settings do not exist yet, create a new record
    if (!current?.id) {
      console.log('Creating new webhook settings record with default_signup_credits');
      const { error } = await supabase
        .from('webhook_settings')
        .insert([{ 
          url: '',
          mybusiness_url: '',
          questions_url: '',
          default_signup_credits,
          updated_at: new Date().toISOString() 
        }]);
        
      if (error) {
        console.error('Error creating default signup credits settings:', error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Access Error",
            description: "You don't have permission to create default signup credits settings. Admin privileges required.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Error",
          description: "Failed to create default signup credits settings: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Default signup credits settings created successfully",
      });
      return true;
    }

    // Update existing settings
    const { error } = await supabase
      .from('webhook_settings')
      .update({ 
        default_signup_credits, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating default signup credits settings:', error);
      
      if (error.code === 'PGRST301') {
        toast({
          title: "Access Error",
          description: "You don't have permission to update default signup credits settings. Admin privileges required.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Error",
        description: "Failed to update default signup credits settings: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Default signup credits settings updated successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in updateDefaultSignupCredits:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating default signup credits settings",
      variant: "destructive",
    });
    return false;
  }
};

export const updateValuePropositionWebhookSettings = async (value_proposition_url: string): Promise<boolean> => {
  try {
    // Get the current settings first
    const current = await fetchWebhookSettings();
    
    // If settings do not exist yet, create a new record
    if (!current?.id) {
      console.log('Creating new webhook settings record with value_proposition_url');
      const { error } = await supabase
        .from('webhook_settings')
        .insert([{ 
          url: current?.url || '',
          mybusiness_url: current?.mybusiness_url || '',
          questions_url: current?.questions_url || '',
          value_proposition_url,
          updated_at: new Date().toISOString() 
        }]);
        
      if (error) {
        console.error('Error creating value proposition webhook settings:', error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Access Error",
            description: "You don't have permission to create value proposition webhook settings. Admin privileges required.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Error",
          description: "Failed to create value proposition webhook settings: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Value proposition webhook settings created successfully",
      });
      return true;
    }

    // Update existing settings
    const { error } = await supabase
      .from('webhook_settings')
      .update({ 
        value_proposition_url, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating value proposition webhook settings:', error);
      
      if (error.code === 'PGRST301') {
        toast({
          title: "Access Error",
          description: "You don't have permission to update value proposition webhook settings. Admin privileges required.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Error",
        description: "Failed to update value proposition webhook settings: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Value proposition webhook settings updated successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in updateValuePropositionWebhookSettings:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating value proposition webhook settings",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Update the company research webhook URL
 */
export async function updateCompanyResearchWebhookSettings(url: string): Promise<boolean> {
  try {
    console.log('Updating company research webhook URL to:', url);
    
    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('webhook_settings')
      .select('id, company_research_url')
      .limit(1);
      
    if (fetchError) {
      console.error('Error fetching webhook settings:', fetchError);
      toast({
        title: "Error",
        description: "Failed to fetch current webhook settings",
        variant: "destructive",
      });
      return false;
    }
    
    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('webhook_settings')
        .update({ company_research_url: url })
        .eq('id', existingSettings[0].id);
        
      if (updateError) {
        console.error('Error updating company research webhook settings:', updateError);
        toast({
          title: "Error",
          description: "Failed to update company research webhook URL",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // Create new settings
      const { error: insertError } = await supabase
        .from('webhook_settings')
        .insert({ company_research_url: url });
        
      if (insertError) {
        console.error('Error creating company research webhook settings:', insertError);
        toast({
          title: "Error",
          description: "Failed to create company research webhook settings",
          variant: "destructive",
        });
        return false;
      }
    }
    
    console.log('Company research webhook URL updated successfully');
    toast({
      title: "Success",
      description: "Company research webhook URL updated successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error in updateCompanyResearchWebhookSettings:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
}
