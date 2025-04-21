
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EmailSettings } from '@/types/email';
import { checkOAuthColumnsExist } from '@/services/o365AuthService';

interface CompleteEmailSettings extends EmailSettings {
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
}

export const useEmailSettings = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailProvider, setEmailProvider] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [authType, setAuthType] = useState<'password' | 'oauth2'>('password');
  const [oauth2ClientId, setOauth2ClientId] = useState('');
  const [oauth2ClientSecret, setOauth2ClientSecret] = useState('');
  const [existingSettings, setExistingSettings] = useState<CompleteEmailSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [oauthColumnsExist, setOauthColumnsExist] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  const checkMigrationStatus = async () => {
    try {
      const columnsExist = await checkOAuthColumnsExist();
      console.log('OAuth columns exist:', columnsExist);
      setOauthColumnsExist(columnsExist);
    } catch (error) {
      console.error('Error checking OAuth columns:', error);
      setOauthColumnsExist(false);
    }
  };

  const fetchEmailSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log('Fetched email settings:', data);
      
      if (data) {
        const settings = data as CompleteEmailSettings;
        setExistingSettings(settings);
        setEmailAddress(settings.email_address);
        setEmailProvider(settings.email_provider);
        setSmtpHost(settings.smtp_host);
        setSmtpPort(settings.smtp_port.toString());
        
        if (settings.oauth2_client_id) {
          setOauth2ClientId(settings.oauth2_client_id);
          setAuthType('oauth2');
        } else {
          setAuthType('password');
        }
        
        if (settings.oauth2_client_secret) {
          setOauth2ClientSecret(settings.oauth2_client_secret);
        }
      } else {
        setExistingSettings(null);
        resetForm();
      }
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email settings: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailAddress('');
    setEmailPassword('');
    setEmailProvider('');
    setSmtpHost('');
    setSmtpPort('');
    setOauth2ClientId('');
    setOauth2ClientSecret('');
    setAuthType('password');
  };

  const validateForm = () => {
    if (!emailAddress || !emailProvider || !smtpHost || !smtpPort) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }
    
    if (authType === 'password') {
      if (!existingSettings && !emailPassword) {
        toast({
          title: 'Missing Password',
          description: 'Please provide an app password',
          variant: 'destructive',
        });
        return false;
      }
    } else if (authType === 'oauth2' && oauthColumnsExist) {
      if (!oauth2ClientId || !oauth2ClientSecret) {
        toast({
          title: 'Missing OAuth2 Credentials',
          description: 'Please provide all OAuth2 credentials',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return true;
  };

  return {
    emailAddress,
    setEmailAddress,
    emailPassword,
    setEmailPassword,
    emailProvider,
    setEmailProvider,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    authType,
    setAuthType,
    oauth2ClientId,
    setOauth2ClientId,
    oauth2ClientSecret,
    setOauth2ClientSecret,
    existingSettings,
    setExistingSettings,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isDeleting,
    setIsDeleting,
    isAuthenticating,
    setIsAuthenticating,
    oauthColumnsExist,
    checkMigrationStatus,
    fetchEmailSettings,
    resetForm,
    validateForm,
  };
};
