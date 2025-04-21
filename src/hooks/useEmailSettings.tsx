
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EmailSettings } from '@/types/email';
import { checkOAuthColumnsExist, verifyO365Auth } from '@/services/o365AuthService';

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
  const [hasValidOAuth, setHasValidOAuth] = useState(false);

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

  const checkOAuthStatus = async () => {
    if (!user) return;
    try {
      const hasValid = await verifyO365Auth(user.id);
      setHasValidOAuth(hasValid);
      console.log('User has valid OAuth2 credentials:', hasValid);
    } catch (error) {
      console.error('Error checking OAuth status:', error);
    }
  };

  const fetchEmailSettings = async () => {
    if (!user) {
      console.log('No user logged in, cannot fetch email settings');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching email settings for user ID:', user.id);
      
      // First, check if RLS policies are properly set up
      const rls = await supabase.rpc('get_user_email_settings');
      console.log('RLS function result:', rls);
      
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching email settings:', error);
        throw error;
      }
      
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

        // Check if we have a valid OAuth2 refresh token
        setHasValidOAuth(!!settings.oauth2_refresh_token && settings.email_provider === 'office365');
        console.log('Has valid OAuth2 token:', !!settings.oauth2_refresh_token);
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
    setHasValidOAuth(false);
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
    hasValidOAuth,
    setHasValidOAuth,
    checkMigrationStatus,
    checkOAuthStatus,
    fetchEmailSettings,
    resetForm,
    validateForm,
  };
};
