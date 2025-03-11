
import { supabase } from '@/integrations/supabase/client';
import { BusinessData } from '@/types/company';

/**
 * Update user profile information
 */
export const updateProfile = async (userId: string, updates: {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  sales_info?: string;
  website_url?: string;
  business_data?: BusinessData;
}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

/**
 * Get user profile data
 */
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * Add credits to a user's account
 */
export const addCredits = async (userId: string, amount: number, reason: string) => {
  try {
    // Get current credits
    const profile = await getProfile(userId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    const newCredits = (profile.credits || 0) + amount;
    
    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log the transaction
    const { error: logError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'add',
        reason,
        balance: newCredits
      });
    
    if (logError) {
      console.error('Error logging credit transaction:', logError);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
};

/**
 * Remove credits from a user's account
 */
export const removeCredits = async (userId: string, amount: number, reason: string) => {
  try {
    // Get current credits
    const profile = await getProfile(userId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Check if user has enough credits
    if ((profile.credits || 0) < amount) {
      throw new Error('Not enough credits');
    }
    
    const newCredits = (profile.credits || 0) - amount;
    
    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log the transaction
    const { error: logError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'remove',
        reason,
        balance: newCredits
      });
    
    if (logError) {
      console.error('Error logging credit transaction:', logError);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing credits:', error);
    throw error;
  }
};

/**
 * Get user credit transactions
 */
export const getCreditTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return [];
  }
};
