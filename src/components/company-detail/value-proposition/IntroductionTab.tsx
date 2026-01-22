import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SendEmailButton from '../../dashboard/SendEmailButton';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface IntroductionTabProps {
  companyId: string;
  companyName: string;
  companyEmail?: string | null;
  displayIntroduction: string;
  onIntroductionChange: (value: string) => void;
  onCopySuccess?: () => void;
  adjustTextareaHeight?: (textarea: HTMLTextAreaElement) => void;
  onSave?: () => void;
  displaySubject: string;
}

const IntroductionTab: React.FC<IntroductionTabProps> = ({
  companyId,
  companyName,
  companyEmail,
  displayIntroduction,
  onIntroductionChange,
  onCopySuccess,
  adjustTextareaHeight,
  onSave,
  displaySubject
}) => {
  const [copyToastShown, setCopyToastShown] = React.useState(false);
  const { toast } = useToast();
  const { flags } = useFeatureFlags();

  const handleIntroductionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onIntroductionChange(event.target.value);
  };

  const handleCopyIntro = () => {
    navigator.clipboard.writeText(displayIntroduction);
    if (!copyToastShown) {
      toast({
        title: "Copied!",
        description: "Introduction text copied to clipboard.",
      });
      setCopyToastShown(true);
      setTimeout(() => setCopyToastShown(false), 3000);
    }
    if (onCopySuccess) {
      onCopySuccess();
    }
  };

  const handleTextareaRef = (textarea: HTMLTextAreaElement | null) => {
    if (textarea && adjustTextareaHeight) {
      adjustTextareaHeight(textarea);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="introduction">Introduction Email Body</Label>
      <Textarea
        id="introduction"
        placeholder="Write an introduction for this company..."
        className="min-h-[200px] font-light leading-relaxed"
        value={displayIntroduction}
        onChange={handleIntroductionChange}
        ref={handleTextareaRef}
      />
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {flags.emailModuleEnabled 
            ? "Denna introduktion används i ditt email till företaget."
            : "Kopiera texten och klistra in i Hubspot."
          }
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyIntro}
            disabled={!displayIntroduction}
          >
            <Copy className="mr-2 h-4 w-4" />
            Kopiera
          </Button>
          
          {flags.emailModuleEnabled && companyEmail && (
            <SendEmailButton 
              recipientEmail={companyEmail}
              recipientName={companyName}
              subject={displaySubject || `Value proposition for ${companyName}`}
              content={displayIntroduction}
              companyId={companyId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionTab;
