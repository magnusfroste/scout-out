
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'id'>>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};
