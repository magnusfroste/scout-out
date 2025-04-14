import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isSending, setIsSending] = useState(false);
  const [hasEmailSettings, setHasEmailSettings] = useState<boolean | null>(null);
  const [emailSubject, setEmailSubject] = useState(subject || `Introduction to ${recipientName}`);
  const [emailContent, setEmailContent] = useState(content);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // Reset email content when props change
  useEffect(() => {
    setEmailContent(content);
    setEmailSubject(subject || `Introduction to ${recipientName}`);
  }, [content, subject, recipientName]);
  
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const checkEmailSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      setHasEmailSettings(!!data);
      setIsOpen(true);
    } catch (error) {
      setHasEmailSettings(false);
      setIsOpen(true);
    }
  };

  const handleSendEmail = async () => {
    if (!user || !recipientEmail || !emailContent) return;
    
    setIsSending(true);
    setErrorDetails(null);
    try {
      console.log('Attempting to send email to:', recipientEmail);
      console.log('Email data:', {
        subject: emailSubject,
        contentLength: emailContent.length,
        senderName: userProfile?.business_data?.company_name || 'Your Business'
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
            senderName: userProfile?.business_data?.company_name || 'Your Business'
          },
          userId: user.id
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
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      console.error('Error details:', error.message);
      toast({
        title: 'Error',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        onClick={checkEmailSettings}
        disabled={disabled || !recipientEmail || !content}
      >
        <Mail className="h-4 w-4" />
        Send as Email
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send your introduction directly as an email to {recipientName}.
            </DialogDescription>
          </DialogHeader>
          
          {hasEmailSettings === false && (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
              <AlertDescription>
                You need to configure your email settings first. Go to your profile settings to set up your email.
              </AlertDescription>
            </Alert>
          )}
          
          {hasEmailSettings && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipientEmail}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            {errorDetails && (
              <div className="w-full mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs font-mono overflow-auto max-h-40">
                <pre>{errorDetails}</pre>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            
            {hasEmailSettings && (
              <Button 
                onClick={handleSendEmail} 
                disabled={isSending || !recipientEmail || !emailContent}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            )}
            
            {hasEmailSettings === false && (
              <Button 
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to email settings
                  window.location.href = '/settings';
                }}
              >
                Configure Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendEmailButton;
