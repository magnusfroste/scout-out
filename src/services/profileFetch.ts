
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Try to get the existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // If it's not a "not found" error, return null
      if (error.code !== 'PGRST116') {
        return null;
      }
      
      // Profile doesn't exist, create one with database defaults
      console.log('Profile not found, creating new profile for user:', userId);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: null,
          last_name: null,
          avatar_url: null,
          is_admin: false,
          website_url: null,
          business_data: null
        })
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }
      
      console.log('New profile created:', newProfile);
      return newProfile as UserProfile;
    }
    
    // Profile exists, return it
    console.log('Profile found:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};
