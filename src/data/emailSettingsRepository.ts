/**
 * Email Settings Repository - Data access for user email settings
 */

import { supabase } from '@/integrations/supabase/client';
import { EmailSettings, EmailSettingsInsert, EmailSettingsUpdate } from '@/models/email';

export const emailSettingsRepository = {
  /**
   * Fetch email settings for a user
   */
  async findByUserId(userId: string): Promise<EmailSettings | null> {
    const { data, error } = await supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching email settings:', error);
      return null;
    }
    
    return data as EmailSettings;
  },

  /**
   * Fetch email settings using the database function
   */
  async findByCurrentUser(): Promise<EmailSettings | null> {
    const { data, error } = await supabase.rpc('get_user_email_settings');

    if (error) {
      console.error('Error fetching email settings via RPC:', error);
      return null;
    }
    
    return data?.[0] as EmailSettings || null;
  },

  /**
   * Create new email settings
   */
  async create(settings: EmailSettingsInsert): Promise<EmailSettings | null> {
    const { data, error } = await supabase
      .from('user_email_settings')
      .insert(settings)
      .select()
      .single();

    if (error) {
      console.error('Error creating email settings:', error);
      return null;
    }
    
    return data as EmailSettings;
  },

  /**
   * Update email settings
   */
  async update(id: string, userId: string, updates: EmailSettingsUpdate): Promise<boolean> {
    const { error } = await supabase
      .from('user_email_settings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating email settings:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Update email settings by user ID
   */
  async updateByUserId(userId: string, updates: EmailSettingsUpdate): Promise<boolean> {
    const { error } = await supabase
      .from('user_email_settings')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating email settings:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Delete email settings
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_email_settings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting email settings:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Upsert email settings (create or update)
   */
  async upsert(userId: string, settings: Omit<EmailSettingsInsert, 'user_id'>): Promise<EmailSettings | null> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      const success = await this.update(existing.id, userId, settings);
      if (success) {
        return { ...existing, ...settings };
      }
      return null;
    }
    
    return this.create({ ...settings, user_id: userId });
  }
};
