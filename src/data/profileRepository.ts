/**
 * Profile Repository - Data access for user profiles
 */

import { supabase } from '@/integrations/supabase/client';
import { UserProfile, ProfileInsert, ProfileUpdate } from '@/models/profile';

export const profileRepository = {
  /**
   * Fetch a user profile by ID
   */
  async findById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },

  /**
   * Create a new user profile
   */
  async create(profile: ProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },

  /**
   * Update a user profile
   */
  async update(userId: string, updates: ProfileUpdate): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Ensure a profile exists for a user, creating one if needed
   */
  async ensureExists(userId: string): Promise<UserProfile | null> {
    // Try to get existing profile
    const existing = await this.findById(userId);
    if (existing) return existing;

    // Create new profile with defaults
    return this.create({
      id: userId,
      first_name: null,
      last_name: null,
      avatar_url: null,
      is_admin: false,
      website_url: null,
      business_data: null
    });
  }
};
