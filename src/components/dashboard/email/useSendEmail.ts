
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEmailParams {
  recipientEmail: string;
  emailSubject: string;
  emailContent: string;
  userId: string;
  senderName: string;
}

export const useSendEmail = () => {
  const [isSending, setIsSending] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();

  const sendEmail = async ({
    recipientEmail, 
    emailSubject, 
    emailContent, 
    userId,
    senderName
  }: SendEmailParams) => {
    if (!userId || !recipientEmail || !emailContent) return false;
    
    setIsSending(true);
    setErrorDetails(null);
    
    try {
      console.log('Attempting to send email to:', recipientEmail);
      console.log('Email data:', {
        subject: emailSubject,
        contentLength: emailContent.length,
        senderName
      });
      
      const response = await fetch(`https://pqskutdrekcinpymvigm.supabase.co/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          emailData: {
            recipient: recipientEmail,
            subject: emailSubject,
            content: emailContent,
            senderName
          },
          userId
        })
      });
      
      const result = await response.json();
      console.log('Email send response:', result);
      
      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Failed to send email';
        const detailsStr = result.details ? JSON.stringify(result.details, null, 2) : '';
        const stackStr = result.stack ? result.stack : '';
        
        const fullErrorDetails = `${errorMsg}\n\n${detailsStr}\n\n${stackStr}`;
        setErrorDetails(fullErrorDetails);
        
        throw new Error(errorMsg);
      }
      
      toast({
        title: 'Success',
        description: 'Email sent successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending email:', error);
      console.error('Error details:', error.message);
      toast({
        title: 'Error',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    errorDetails,
    sendEmail
  };
};

export default useSendEmail;
