
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ValuePropositionWebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
  showDescription?: boolean;
}

const ValuePropositionWebhookForm: React.FC<ValuePropositionWebhookFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  isDisabled,
  showDescription = false
}) => {
  const [inputValue, setInputValue] = useState(webhookUrl);
  
  const handleSave = () => {
    setWebhookUrl(inputValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="valuePropositionWebhookUrl">Value Proposition Webhook URL</Label>
        <div className="flex gap-2">
          <Input
            id="valuePropositionWebhookUrl"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your value proposition webhook URL"
            disabled={isDisabled}
            className="flex-1"
          />
          <Button 
            onClick={handleSave}
            disabled={isDisabled || inputValue === webhookUrl}
          >
            Save
          </Button>
        </div>
        {showDescription && (
          <p className="text-xs text-muted-foreground">
            Enter the URL for your value proposition webhook endpoint
          </p>
        )}
      </div>
    </div>
  );
};

export default ValuePropositionWebhookForm;
