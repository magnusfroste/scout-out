
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmailFormProps {
  recipientEmail: string;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailContent: string;
  setEmailContent: (content: string) => void;
}

const EmailForm: React.FC<EmailFormProps> = ({
  recipientEmail,
  emailSubject,
  setEmailSubject,
  emailContent,
  setEmailContent,
}) => {
  return (
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
  );
};

export default EmailForm;
