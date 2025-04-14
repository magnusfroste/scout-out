
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import EmailDialog from './email/EmailDialog';
import useEmailSettings from './email/useEmailSettings';
import useSendEmail from './email/useSendEmail';

interface SendEmailButtonProps {
  recipientEmail: string;
  recipientName: string;
  subject?: string;
  content: string;
  disabled?: boolean;
}

const SendEmailButton = ({ 
  recipientEmail, 
  recipientName, 
  subject = '', 
  content, 
  disabled = false 
}: SendEmailButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(subject || `Introduction to ${recipientName}`);
  const [emailContent, setEmailContent] = useState(content);
  
  // Reset email content when props change
  useEffect(() => {
    setEmailContent(content);
    setEmailSubject(subject || `Introduction to ${recipientName}`);
  }, [content, subject, recipientName]);
  
  const { user, userProfile } = useAuth();
  const { hasEmailSettings, checkEmailSettings } = useEmailSettings(user?.id);
  const { isSending, errorDetails, sendEmail } = useSendEmail();

  const handleCheckEmailSettings = async () => {
    if (!user) return;
    
    await checkEmailSettings(user.id);
    setIsOpen(true);
  };

  const handleSendEmail = async () => {
    if (!user || !recipientEmail || !emailContent) return;
    
    // Accessing the company name safely
    const senderCompanyName = userProfile?.business_data?.elevator_pitch?.company_name || 
                             userProfile?.business_data?.contact_info?.company_name || 
                             'Your Business';
    
    const success = await sendEmail({
      recipientEmail,
      emailSubject,
      emailContent,
      userId: user.id,
      senderName: senderCompanyName
    });
    
    if (success) {
      setIsOpen(false);
    }
  };

  const goToSettings = () => {
    setIsOpen(false);
    window.location.href = '/settings';
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        onClick={handleCheckEmailSettings}
        disabled={disabled || !recipientEmail || !content}
      >
        <Mail className="h-4 w-4" />
        Send as Email
      </Button>
      
      <EmailDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        recipientEmail={recipientEmail}
        recipientName={recipientName}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailContent={emailContent}
        setEmailContent={setEmailContent}
        hasEmailSettings={hasEmailSettings}
        isSending={isSending}
        errorDetails={errorDetails}
        handleSendEmail={handleSendEmail}
        goToSettings={goToSettings}
      />
    </>
  );
};

export default SendEmailButton;
