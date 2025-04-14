
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    try {
      // Get user's email settings first
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

      console.log('Sending email with settings:', {
        to: recipientEmail,
        subject: subject,
        emailProvider: emailSettings.email_provider,
        senderEmail: emailSettings.email_address
      });
      
      // Prepare clean HTML content with proper paragraphs
      const htmlContent = formatEmailContent(content);
      
      // Prepare the request data
      const emailData = {
        to: recipientEmail,
        to_name: recipientName,
        subject: subject,
        html_content: htmlContent,
        sender_settings: {
          email: emailSettings.email_address,
          host: emailSettings.smtp_host,
          port: emailSettings.smtp_port,
          password: emailSettings.app_password,
          provider: emailSettings.email_provider
        }
      };
      
      // Log the email request without sensitive data
      console.log('Email request payload:', JSON.stringify({
        ...emailData,
        html_content: `${htmlContent.substring(0, 50)}... (truncated)`,
        sender_settings: {
          ...emailData.sender_settings,
          password: '******' // Hide password in logs
        }
      }));

      // Call the edge function to send the email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: JSON.stringify(emailData)
      });
      
      console.log('Edge function response:', data);

      if (error) {
        console.error('Error from Edge Function:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('Email sending failed:', data);
        throw new Error(errorMessage);
      }

      toast({
        title: "Email sent",
        description: `Email successfully sent to ${recipientEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error sending email",
        description: error.message || "There was a problem sending your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Format email content with proper HTML structure
   */
  const formatEmailContent = (text: string): string => {
    if (!text) return "";
    
    // Split content by newlines and wrap in paragraphs
    const paragraphs = text.split(/\n\n+/);
    const formattedContent = paragraphs.map(p => {
      // Replace single newlines with <br>
      const withLineBreaks = p.replace(/\n/g, '<br>');
      return `<p>${withLineBreaks}</p>`;
    }).join('');
    
    return formattedContent;
  };

  return (
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
    </Button>
  );
};

export default SendEmailButton;
