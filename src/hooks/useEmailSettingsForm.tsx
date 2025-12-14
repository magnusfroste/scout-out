/**
 * Hook for email settings form operations
 * Uses the data layer for database operations
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { emailSettingsRepository } from '@/data/emailSettingsRepository';
import { EmailSettings, EmailSettingsUpdate } from '@/models/email';

export const useEmailSettingsForm = (
  emailAddress: string,
  emailPassword: string,
  emailProvider: string,
  smtpHost: string,
  smtpPort: string,
  authType: 'password' | 'oauth2',
  oauth2ClientId: string,
  oauth2ClientSecret: string,
  existingSettings: EmailSettings | null,
  hasValidOAuth: boolean,
  setHasValidOAuth: (value: boolean) => void,
  fetchEmailSettings: () => Promise<void>,
  validateForm: () => boolean
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveSettings = async (refreshToken?: string): Promise<boolean> => {
    console.group('Save Email Settings');
    console.log('User:', user ? user.id : 'No user');
    console.log('Auth Type:', authType);
    console.log('Email Provider:', emailProvider);
    console.log('SMTP Host:', smtpHost);
    console.log('SMTP Port:', smtpPort);
    console.log('Has refresh token:', !!refreshToken);

    if (!user) {
      console.error('No user found, cannot save settings');
      toast({
        title: 'Error',
        description: 'You must be logged in to save email settings',
        variant: 'destructive',
      });
      console.groupEnd();
      return false;
    }
    
    if (!validateForm()) {
      console.error('Form validation failed');
      console.groupEnd();
      return false;
    }
    
    setIsSaving(true);
    try {
      const settingsData: any = {
        email_address: emailAddress,
        email_provider: emailProvider,
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort),
        is_active: true,
        user_id: user.id
      };
      
      if (authType === 'password') {
        console.log('Using Password Authentication');
        if (emailPassword) {
          settingsData.app_password = emailPassword;
        } else if (!existingSettings) {
          console.error('App password required for new settings');
          throw new Error('App password is required for new email settings');
        }
        
        settingsData.oauth2_client_id = null;
        settingsData.oauth2_client_secret = null;
        settingsData.oauth2_refresh_token = null;
      } else if (authType === 'oauth2') {
        console.log('Using OAuth2 Authentication');
        if (!oauth2ClientId || !oauth2ClientSecret) {
          console.error('Missing OAuth2 credentials');
          throw new Error('OAuth2 client ID and client secret are required');
        }
        
        settingsData.oauth2_client_id = oauth2ClientId;
        settingsData.oauth2_client_secret = oauth2ClientSecret;
        
        if (refreshToken) {
          console.log('Adding Refresh Token from recent authentication');
          settingsData.oauth2_refresh_token = refreshToken;
          setHasValidOAuth(true);
        } else if (existingSettings?.oauth2_refresh_token) {
          console.log('Using Existing Refresh Token');
          settingsData.oauth2_refresh_token = existingSettings.oauth2_refresh_token;
        } else {
          console.log('No refresh token available');
        }
        
        settingsData.app_password = 'oauth2_not_used';
      }
      
      console.log('Prepared Settings Data:', settingsData);
      
      let success: boolean;
      if (existingSettings) {
        console.log('Updating Existing Settings');
        success = await emailSettingsRepository.update(existingSettings.id, user.id, settingsData as EmailSettingsUpdate);
      } else {
        console.log('Creating New Email Settings');
        const created = await emailSettingsRepository.create(settingsData);
        success = !!created;
      }
      
      if (!success) {
        throw new Error('Failed to save settings');
      }
      
      console.log('Save successful');
      
      toast({
        title: 'Success',
        description: `Email settings ${existingSettings ? 'updated' : 'saved'} successfully`,
      });
      
      // If we have a refresh token, make sure we update hasValidOAuth
      if (settingsData.oauth2_refresh_token && emailProvider === 'office365') {
        setHasValidOAuth(true);
      }
      
      await fetchEmailSettings();
      return true;
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save email settings: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
      console.groupEnd();
    }
  };

  const handleDeleteSettings = async () => {
    if (!user || !existingSettings) return;
    
    setIsDeleting(true);
    try {
      const success = await emailSettingsRepository.delete(existingSettings.id, user.id);
      
      if (!success) throw new Error('Delete failed');
      
      toast({
        title: 'Success',
        description: 'Email settings deleted successfully',
      });
      
      setHasValidOAuth(false);
      await fetchEmailSettings();
    } catch (error: any) {
      console.error('Error deleting email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to delete email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isSaving,
    isDeleting,
    handleSaveSettings,
    handleDeleteSettings,
  };
};
