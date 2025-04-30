import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, AlertCircle, ExternalLink, InfoIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmailSettings } from '@/types/email';
import { verifyO365Auth, sendEmailViaGraphAPI } from '@/services/o365AuthService';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface CompleteEmailSettings extends EmailSettings {
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
}

interface SendEmailButtonProps {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  disabled?: boolean;
  companyId?: string; // New prop to track which company the email is being sent to
  onEmailSent?: () => Promise<void>; // New callback to trigger data refresh
}

const SendEmailButton: React.FC<SendEmailButtonProps> = ({
  recipientEmail,
  recipientName = "",
  subject,
  content,
  disabled = false,
  companyId,
  onEmailSent
}) => {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [hasValidOAuth, setHasValidOAuth] = useState(true);
  const [isO365SmtpDisabled, setIsO365SmtpDisabled] = useState(false);
  const [useGraphAPI, setUseGraphAPI] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [appName, setAppName] = useState('');
  const [appId, setAppId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
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
    
    checkOAuthStatus();
  }, [user]);

  const getGraphAccessToken = async (settings: CompleteEmailSettings): Promise<string> => {
    if (!settings.oauth2_client_id || !settings.oauth2_client_secret || !settings.oauth2_refresh_token) {
      throw new Error('Missing OAuth2 credentials');
    }

    try {
      console.log('Getting fresh access token from refresh token');
      const { data, error } = await supabase.functions.invoke('o365-auth-refresh', {
        body: JSON.stringify({
          clientId: settings.oauth2_client_id,
          clientSecret: settings.oauth2_client_secret,
          refreshToken: settings.oauth2_refresh_token
        })
      });

      if (error) {
        console.error('Error refreshing token:', error);
        
        if (error.message && error.message.includes('AADSTS65001')) {
          const appIdMatch = error.message.match(/application with ID '([^']+)'/);
          const appNameMatch = error.message.match(/named '([^']+)'/);
          
          if (appIdMatch && appIdMatch[1]) {
            setAppId(appIdMatch[1]);
          }
          
          if (appNameMatch && appNameMatch[1]) {
            setAppName(appNameMatch[1]);
          }
          
          setNeedsConsent(true);
          throw new Error('Microsoft requires you to grant consent for this application. Please reconnect in Settings.');
        }
        
        throw new Error('Failed to refresh OAuth2 token. Please re-authenticate with Microsoft.');
      }

      if (!data || !data.access_token) {
        throw new Error('No access token received from token refresh');
      }

      console.log('Access token refreshed successfully');
      return data.access_token;
    } catch (error) {
      console.error('Error getting Graph access token:', error);
      throw error;
    }
  };

  const sendEmail = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send emails.",
        variant: "destructive"
      });
      return;
    }

    if (!recipientEmail || !subject || !content) {
      toast({
        title: "Missing information",
        description: "Email, subject, and content are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setLastError(null);
    setDiagnosticInfo(null);
    setIsO365SmtpDisabled(false);
    setUseGraphAPI(false);
    setNeedsConsent(false);
    
    try {
      console.log('Starting email sending process...');
      
      const { data: emailSettings, error: settingsError } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (settingsError) {
        console.error('Error fetching email settings:', settingsError);
        if (settingsError.code === 'PGRST116') {
          throw new Error('No email settings found. Please configure your email settings first.');
        }
        throw settingsError;
      }

      if (!emailSettings) {
        throw new Error('No active email settings found. Please configure your email settings.');
      }

      const settings = emailSettings as CompleteEmailSettings;
      console.log('Email settings retrieved:', {
        provider: settings.email_provider,
        email: settings.email_address,
        host: settings.smtp_host,
        port: settings.smtp_port,
        hasOAuth2: !!(settings.oauth2_client_id && settings.oauth2_client_secret && settings.oauth2_refresh_token)
      });
      
      if (settings.email_provider === 'office365') {
        if (!settings.oauth2_client_id || !settings.oauth2_client_secret || !settings.oauth2_refresh_token) {
          console.error('Missing OAuth2 credentials for Office 365');
          throw new Error('OAuth2 credentials are required for Office 365. Please update your email settings.');
        }
        
        if (!settings.oauth2_refresh_token) {
          console.error('Missing OAuth2 refresh token for Office 365');
          setHasValidOAuth(false);
          throw new Error('Missing OAuth2 refresh token for Office 365. Please authenticate with Microsoft again.');
        }
      }
      
      const htmlContent = formatEmailContent(content);
      
      if (settings.email_provider === 'office365' && 
          settings.oauth2_client_id && 
          settings.oauth2_client_secret && 
          settings.oauth2_refresh_token) {
        
        try {
          console.log('Attempting to send email via Microsoft Graph API');
          setUseGraphAPI(true);
          
          const accessToken = await getGraphAccessToken(settings);
          
          console.log('Access token obtained, calling Graph API with token length:', accessToken.length);
          const graphResult = await sendEmailViaGraphAPI(
            accessToken,
            recipientEmail,
            subject,
            htmlContent,
            settings.email_address
          );
          
          console.log('Graph API email result:', graphResult);
          
          toast({
            title: "Email sent via Graph API",
            description: `Email successfully sent to ${recipientEmail}`,
          });
          
          setDiagnosticInfo({
            success: true,
            method: 'graph_api',
            timestamp: new Date().toISOString(),
            result: graphResult
          });
          
          setIsSending(false);
          return;
        } catch (graphError: any) {
          console.error('Error sending email via Graph API:', graphError);
          
          if (graphError && graphError.message && graphError.message.includes('AADSTS65001')) {
            const appIdMatch = graphError.message.match(/application with ID '([^']+)'/);
            const appNameMatch = graphError.message.match(/named '([^']+)'/);
            
            if (appIdMatch && appIdMatch[1]) {
              setAppId(appIdMatch[1]);
            }
            
            if (appNameMatch && appNameMatch[1]) {
              setAppName(appNameMatch[1]);
            }
            
            setNeedsConsent(true);
            setDiagnosticInfo({
              consentRequired: true,
              errorMessage: graphError.message,
              appId: appIdMatch ? appIdMatch[1] : '',
              appName: appNameMatch ? appNameMatch[1] : ''
            });
            
            throw new Error('Microsoft requires you to grant consent for this application. Please reconnect in Settings.');
          }
          
          if (graphError && graphError.message && (
              graphError.message.includes('authentication') || 
              graphError.message.includes('token') ||
              graphError.message.includes('Authorization') ||
              graphError.message.includes('401')
            )) {
            setHasValidOAuth(false);
            setDiagnosticInfo({
              authError: true,
              errorMessage: graphError.message,
              suggestion: "Your authentication credentials appear to be invalid. Please reconnect with Microsoft."
            });
            
            throw new Error('Authentication failed. Please reconnect your Microsoft account in Settings.');
          }
          
          console.log('Graph API failed, falling back to SMTP if possible');
          setDiagnosticInfo({
            graphApiError: graphError.message,
            fallbackToSMTP: true,
            rawError: graphError
          });
        }
      }
      
      let hubspotBccAddress = null;
      try {
        const { data: emailSettings, error } = await supabase
          .from('user_email_settings')
          .select('hubspot_bcc_address')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (emailSettings?.hubspot_bcc_address) {
          hubspotBccAddress = emailSettings.hubspot_bcc_address;
        }
      } catch (error) {
        console.error('Error fetching Hubspot BCC address:', error);
      }

      const emailData: any = {
        to: recipientEmail,
        to_name: recipientName,
        subject: subject,
        html_content: htmlContent,
        sender_settings: {
          email: settings.email_address,
          host: settings.smtp_host,
          port: settings.smtp_port,
          provider: settings.email_provider,
          bcc: hubspotBccAddress
        }
      };
      
      if (settings.email_provider === 'office365') {
        if (settings.oauth2_client_id && 
            settings.oauth2_client_secret && 
            settings.oauth2_refresh_token) {
          
          console.log('Using OAuth2 authentication for Office 365');
          emailData.sender_settings.oauth2 = {
            user: settings.email_address,
            clientId: settings.oauth2_client_id,
            clientSecret: settings.oauth2_client_secret,
            refreshToken: settings.oauth2_refresh_token
          };
          
          delete emailData.sender_settings.password;
        } else {
          throw new Error('OAuth2 credentials are required for Office 365. Please update your email settings.');
        }
      } else if (settings.app_password) {
        console.log('Using password authentication');
        emailData.sender_settings.password = settings.app_password;
      } else {
        throw new Error('Authentication credentials are missing. Please update your email settings.');
      }

      console.log('Calling edge function with email data:', {
        to: emailData.to,
        subject: emailData.subject,
        provider: emailData.sender_settings.provider,
        host: emailData.sender_settings.host,
        port: emailData.sender_settings.port,
        hasOauth2: !!emailData.sender_settings.oauth2,
        hasPassword: !!emailData.sender_settings.password
      });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: JSON.stringify({
          ...emailData,
          debug: true
        })
      });
      
      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Error from Edge Function:', error);
        setDiagnosticInfo({
          errorType: 'edge_function',
          error: error
        });
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data) {
        setDiagnosticInfo({
          errorType: 'no_response',
        });
        throw new Error('No response data returned from edge function');
      }
      
      if (!data.success) {
        const errorMessage = data.error || 'Unknown error occurred';
        const errorDetails = data.details || {};
        console.error('Email sending failed:', { error: errorMessage, details: errorDetails });
        
        setDiagnosticInfo({
          errorType: 'send_failure',
          error: errorMessage,
          details: errorDetails
        });
        
        if (errorMessage.includes('SmtpClientAuthentication is disabled') || 
            errorMessage.includes('smtp_auth_disabled')) {
          setIsO365SmtpDisabled(true);
          throw new Error('Microsoft has disabled SMTP Authentication for your tenant. Try using Microsoft Graph API instead.');
        }
        
        if (errorMessage.includes('OAuth2') || 
            errorMessage.includes('authentication') || 
            errorMessage.includes('auth') ||
            errorMessage.includes('token')) {
          setHasValidOAuth(false);
        }
        
        throw new Error(`${errorMessage}`);
      }

      // If the email was sent successfully and we have a companyId, update the sent_email_at timestamp
      if (companyId) {
        try {
          console.log('Email sent successfully, updating sent_email_at for company:', companyId);
          const currentTime = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('company_searches')
            .update({ sent_email_at: currentTime })
            .eq('id', companyId);
            
          if (updateError) {
            console.error('Error updating sent_email_at:', updateError);
            toast({
              title: "Warning",
              description: "Email was sent but we couldn't update the sent timestamp.",
              variant: "destructive",
            });
          } else {
            console.log('Updated sent_email_at for company:', companyId, 'to:', currentTime);
            
            // Call the onEmailSent callback to refresh data if provided
            if (onEmailSent) {
              console.log('Calling onEmailSent callback to refresh data');
              await onEmailSent();
            }
          }
        } catch (updateErr) {
          console.error('Exception updating sent_email_at:', updateErr);
        }
      }

      toast({
        title: "Email sent",
        description: `Email successfully sent to ${recipientEmail}`,
      });
      
      setDiagnosticInfo({
        success: true,
        method: 'smtp',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      const errorMsg = error.message || "There was a problem sending your email. Please try again.";
      setLastError(errorMsg);
      
      if (error.message && error.message.includes('AADSTS65001')) {
        setNeedsConsent(true);
      }
      
      if (error.message && (
          error.message.includes('authentication') || 
          error.message.includes('token') ||
          error.message.includes('login')
        )) {
        setHasValidOAuth(false);
      }
      
      setDiagnosticInfo({
        errorType: 'exception',
        error: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Error sending email",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatEmailContent = (text: string): string => {
    if (!text) return "";
    
    const normalizedText = text.replace(/\r\n/g, '\n');
    
    const paragraphs = normalizedText.split(/\n\n+/);
    return paragraphs.map(p => {
      const withLineBreaks = p.replace(/\n/g, '<br>');
      
      return `<p style="margin-bottom: 16px; line-height: 1.6;">${withLineBreaks}</p>`;
    }).join('');
  };

  const handleReauthenticate = () => {
    window.location.href = '/settings';
  };

  const handleO365SmtpLearnMore = () => {
    window.open('https://aka.ms/smtp_auth_disabled', '_blank');
  };

  return (
    <>
      {needsConsent && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Microsoft Consent Required</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Microsoft requires you to approve the permissions for the app "{appName || 'Microsoft 365'}".
              This is needed for sending emails via the Graph API.
            </p>
            <Link to="/settings" className="flex items-center text-blue-600 hover:underline font-medium">
              <RefreshCw className="mr-1 h-4 w-4" />
              Go to Settings to Reconnect
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      <TooltipProvider>
        <Tooltip open={!!lastError}>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={sendEmail}
                disabled={disabled || isSending || !hasValidOAuth || isO365SmtpDisabled || needsConsent}
                variant="secondary"
                size="sm"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50 dark:border-blue-800"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
                {lastError && <AlertCircle className="ml-2 h-4 w-4 text-red-500" onClick={() => setShowDiagnostics(true)} />}
              </Button>
              
              {(!hasValidOAuth || needsConsent) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReauthenticate}
                  className="ml-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Reconnect
                </Button>
              )}
              
              {isO365SmtpDisabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleO365SmtpLearnMore}
                  className="ml-2 text-xs text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                >
                  <InfoIcon className="mr-1 h-3 w-3" />
                  Using Graph API Instead
                </Button>
              )}
            </div>
          </TooltipTrigger>
          {lastError && (
            <TooltipContent className="max-w-sm">
              <p className="text-sm text-red-500">{lastError}</p>
              <button
                onClick={() => setShowDiagnostics(true)}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                View Diagnostics
              </button>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Sending Diagnostics</DialogTitle>
            <DialogDescription>
              Technical information about the email sending attempt
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-96">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(diagnosticInfo, null, 2)}
            </pre>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {needsConsent && (
                <div className="text-sm text-amber-600 mb-2">
                  <p className="font-medium">Microsoft Consent Required</p>
                  <p>Your Microsoft account needs to authorize the application "{appName || 'Microsoft 365'}" to send emails on your behalf.</p>
                  <p className="mt-1">This is a one-time consent that requires administrator approval in your Microsoft tenant.</p>
                </div>
              )}
              
              {!hasValidOAuth && !needsConsent && (
                <div className="text-sm text-red-500 mb-2">
                  OAuth2 authentication appears to be invalid or expired.
                </div>
              )}
              
              {isO365SmtpDisabled && (
                <div className="text-sm text-amber-600 mb-2">
                  Microsoft has disabled SMTP Authentication for your tenant. This is a security measure by Microsoft.
                  <a 
                    href="https://aka.ms/smtp_auth_disabled"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-500 hover:underline mt-1"
                  >
                    Learn more about Microsoft SMTP Authentication Policies
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {(needsConsent || !hasValidOAuth) && (
                <Link to="/settings">
                  <Button variant="outline">
                    Go to Settings to Reconnect
                  </Button>
                </Link>
              )}
              <Button onClick={() => setShowDiagnostics(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendEmailButton;
