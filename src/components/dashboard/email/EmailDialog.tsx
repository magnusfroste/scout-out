
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmailForm from './EmailForm';

interface EmailDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  recipientEmail: string;
  recipientName: string;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailContent: string;
  setEmailContent: (content: string) => void;
  hasEmailSettings: boolean | null;
  isSending: boolean;
  errorDetails: string | null;
  handleSendEmail: () => Promise<void>;
  goToSettings: () => void;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
  isOpen,
  setIsOpen,
  recipientEmail,
  recipientName,
  emailSubject,
  setEmailSubject,
  emailContent,
  setEmailContent,
  hasEmailSettings,
  isSending,
  errorDetails,
  handleSendEmail,
  goToSettings
}) => {
  return (
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
          <EmailForm
            recipientEmail={recipientEmail}
            emailSubject={emailSubject}
            setEmailSubject={setEmailSubject}
            emailContent={emailContent}
            setEmailContent={setEmailContent}
          />
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
            <Button onClick={goToSettings}>
              Configure Email
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
