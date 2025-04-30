
import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubjectTabProps {
  displaySubject: string;
  onSubjectChange: (value: string) => void;
  onCopySuccess?: () => void;
  onAutoSave?: () => void;
}

const SubjectTab: React.FC<SubjectTabProps> = ({
  displaySubject,
  onSubjectChange,
  onCopySuccess,
  onAutoSave
}) => {
  const [copyToastShown, setCopyToastShown] = React.useState(false);
  const { toast } = useToast();

  const handleSubjectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSubjectChange(event.target.value);
    if (onAutoSave) {
      onAutoSave();
    }
  }, [onSubjectChange, onAutoSave]);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(displaySubject);
    if (!copyToastShown) {
      toast({
        title: "Copied!",
        description: "Subject text copied to clipboard.",
      });
      setCopyToastShown(true);
      setTimeout(() => setCopyToastShown(false), 3000);
    }
    if (onCopySuccess) {
      onCopySuccess();
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="subject">Email Subject Line</Label>
      <Input
        id="subject"
        placeholder="Enter subject line for email..."
        className="font-light"
        value={displaySubject}
        onChange={handleSubjectChange}
      />
      
      <div className="flex justify-end mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopySubject}
          disabled={!displaySubject}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
};

export default SubjectTab;
