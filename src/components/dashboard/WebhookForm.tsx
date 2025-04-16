
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
  showDescription?: boolean;
  labelText?: string;
  description?: string;
}

const WebhookForm: React.FC<WebhookFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  isDisabled,
  showDescription = false,
  labelText = "Webhook URL",
  description = "Enter your webhook URL"
}) => {
  const [inputValue, setInputValue] = useState(webhookUrl);
  
  const handleSave = () => {
    setWebhookUrl(inputValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhookUrl">{labelText}</Label>
        <div className="flex gap-2">
          <Input
            id="webhookUrl"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter your ${labelText.toLowerCase()}`}
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
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default WebhookForm;
