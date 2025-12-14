/**
 * Hook for managing email settings
 * Uses the data layer for database operations
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { emailSettingsRepository } from '@/data/emailSettingsRepository';
import { EmailSettings } from '@/models/email';
import { checkOAuthColumnsExist, verifyO365Auth } from '@/services/o365AuthService';

interface CompleteEmailSettings extends EmailSettings {
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
}

const LOCAL_STORAGE_KEY = 'email_settings_form_data';

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
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!formDataLoaded) return; // Don't save until initial data is loaded
    
    if (user) {
      const formData = {
        emailAddress,
        emailPassword,
        emailProvider,
        smtpHost,
        smtpPort,
        authType,
        oauth2ClientId,
        oauth2ClientSecret,
      };
      
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.id}`, JSON.stringify(formData));
    }
  }, [
    emailAddress,
    emailPassword,
    emailProvider,
    smtpHost,
    smtpPort,
    authType,
    oauth2ClientId,
    oauth2ClientSecret,
    user,
    formDataLoaded
  ]);

  useEffect(() => {
    if (emailProvider === 'office365') {
      setAuthType('oauth2');
      if (!smtpHost) setSmtpHost('smtp.office365.com');
      if (!smtpPort) setSmtpPort('587');
    }
  }, [emailProvider]);

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
      
      const savedFormData = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.id}`);
      let loadedFromLocalStorage = false;
      
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          console.log('Loaded form data from localStorage:', parsedData);
          loadedFromLocalStorage = true;
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
      
      // Use repository to fetch settings
      const data = await emailSettingsRepository.findByUserId(user.id);
      
      console.log('Fetched email settings:', data);
      
      if (data) {
        const settings = data as CompleteEmailSettings;
        setExistingSettings(settings);
        
        if (loadedFromLocalStorage && savedFormData) {
          const parsedData = JSON.parse(savedFormData);
          setEmailAddress(parsedData.emailAddress || settings.email_address);
          setEmailProvider(parsedData.emailProvider || settings.email_provider);
          setSmtpHost(parsedData.smtpHost || settings.smtp_host);
          setSmtpPort(parsedData.smtpPort || settings.smtp_port.toString());
          setAuthType(parsedData.authType || (settings.email_provider === 'office365' ? 'oauth2' : 
                      settings.oauth2_client_id ? 'oauth2' : 'password'));
          setOauth2ClientId(parsedData.oauth2ClientId || settings.oauth2_client_id || '');
          setOauth2ClientSecret(parsedData.oauth2ClientSecret || settings.oauth2_client_secret || '');
        } else {
          setEmailAddress(settings.email_address);
          setEmailProvider(settings.email_provider);
          setSmtpHost(settings.smtp_host);
          setSmtpPort(settings.smtp_port.toString());
          
          if (settings.email_provider === 'office365') {
            setAuthType('oauth2');
          } else if (settings.oauth2_client_id) {
            setAuthType('oauth2');
          } else {
            setAuthType('password');
          }
          
          if (settings.oauth2_client_id) {
            setOauth2ClientId(settings.oauth2_client_id);
          }
          
          if (settings.oauth2_client_secret) {
            setOauth2ClientSecret(settings.oauth2_client_secret);
          }
        }

        const hasValid = !!settings.oauth2_refresh_token && settings.email_provider === 'office365';
        setHasValidOAuth(hasValid);
        console.log('Has valid OAuth2 token:', hasValid);
      } else if (loadedFromLocalStorage && savedFormData) {
        setExistingSettings(null);
        const parsedData = JSON.parse(savedFormData);
        setEmailAddress(parsedData.emailAddress || '');
        setEmailProvider(parsedData.emailProvider || '');
        setSmtpHost(parsedData.smtpHost || '');
        setSmtpPort(parsedData.smtpPort || '');
        setAuthType(parsedData.authType || 'password');
        setOauth2ClientId(parsedData.oauth2ClientId || '');
        setOauth2ClientSecret(parsedData.oauth2ClientSecret || '');
      } else {
        setExistingSettings(null);
        resetForm();
      }
      
      setFormDataLoaded(true);
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
    
    if (user) {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${user.id}`);
    }
    
    setFormDataLoaded(true);
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

  useEffect(() => {
    const init = async () => {
      try {
        await checkMigrationStatus();
        if (user) {
          await fetchEmailSettings();
          await checkOAuthStatus();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing email settings:', error);
        setIsLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load email settings. Please try refreshing the page.',
          variant: 'destructive',
        });
      }
    };

    init();
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.warn('Email settings loading timed out, forcing completion');
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

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
