
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

type ElevatorPitch = {
  company_name?: string;
  industry?: string;
  challenges?: string[];
  solutions?: string[];
};

type ContactInfo = {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
};

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

      // Call the edge function to send the email
      const response = await fetch('https://pqskutdrekcinpymvigm.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          to_name: recipientName,
          subject: subject,
          html_content: content.replace(/\n/g, '<br>'),
          sender_settings: {
            email: emailSettings.email_address,
            host: emailSettings.smtp_host,
            port: emailSettings.smtp_port,
            password: emailSettings.app_password,
            provider: emailSettings.email_provider
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
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
