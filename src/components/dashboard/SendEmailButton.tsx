import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmailSettings } from '@/types/email';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

type CompleteEmailSettings = EmailSettings;

interface SendEmailButtonProps {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  disabled?: boolean;
}

const SendEmailButton: React.FC<SendEmailButtonProps> = ({
  recipientEmail,
  recipientName = "",
  subject,
  content,
  disabled = false
}) => {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
      });
      
      const htmlContent = formatEmailContent(content);
      
      const emailData: any = {
        to: recipientEmail,
        to_name: recipientName,
        subject: subject,
        html_content: htmlContent,
        sender_settings: {
          email: settings.email_address,
          host: settings.smtp_host,
          port: settings.smtp_port,
          provider: settings.email_provider
        }
      };
      
      if (settings.email_provider === 'office365' && 
          settings.oauth2_client_id && 
          settings.oauth2_client_secret && 
          settings.oauth2_refresh_token) {
        
        emailData.sender_settings.oauth2 = {
          user: settings.email_address,
          clientId: settings.oauth2_client_id,
          clientSecret: settings.oauth2_client_secret,
          refreshToken: settings.oauth2_refresh_token
        };
        
        console.log('Using OAuth2 authentication for Office 365');
      } else if (settings.app_password) {
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
        hasOauth2: !!emailData.sender_settings.oauth2
      });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: JSON.stringify(emailData)
      });
      
      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Error from Edge Function:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data) {
        throw new Error('No response data returned from edge function');
      }
      
      if (!data.success) {
        const errorMessage = data.error || 'Unknown error occurred';
        const errorDetails = data.details ? JSON.stringify(data.details) : '';
        console.error('Email sending failed:', { error: errorMessage, details: errorDetails });
        throw new Error(`${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`);
      }

      toast({
        title: "Email sent",
        description: `Email successfully sent to ${recipientEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      const errorMsg = error.message || "There was a problem sending your email. Please try again.";
      setLastError(errorMsg);
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

  return (
    <TooltipProvider>
      <Tooltip open={!!lastError}>
        <TooltipTrigger asChild>
          <Button
            onClick={sendEmail}
            disabled={disabled || isSending}
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
            {lastError && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
          </Button>
        </TooltipTrigger>
        {lastError && (
          <TooltipContent className="max-w-sm">
            <p className="text-sm text-red-500">{lastError}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default SendEmailButton;
