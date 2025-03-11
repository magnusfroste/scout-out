
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  credits: number;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  website_url?: string | null;
  sales_info?: string | null;
}

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
        toast({
          title: "Profile Error",
          description: "Could not load your profile. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
      
      // Profile doesn't exist, create one
      console.log('Profile not found, creating new profile for user:', userId);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          credits: 50,
          first_name: null,
          last_name: null,
          avatar_url: null,
          is_admin: false,
          website_url: null,
          sales_info: null
        })
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        toast({
          title: "Profile Error",
          description: "Could not create user profile. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('New profile created:', newProfile);
      return {
        id: newProfile.id,
        credits: newProfile.credits || 0,
        first_name: newProfile.first_name,
        last_name: newProfile.last_name,
        avatar_url: newProfile.avatar_url,
        is_admin: newProfile.is_admin,
        website_url: newProfile.website_url,
        sales_info: newProfile.sales_info
      } as UserProfile;
    }
    
    // Profile exists, return it
    console.log('Profile found:', data);
    return {
      id: data.id,
      credits: data.credits || 0,
      first_name: data.first_name,
      last_name: data.last_name,
      avatar_url: data.avatar_url,
      is_admin: data.is_admin,
      website_url: data.website_url,
      sales_info: data.sales_info
    } as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    toast({
      title: "Profile Error",
      description: "An unexpected error occurred. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'id'>>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    toast({
      title: "Update Failed",
      description: "Could not update your profile. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
