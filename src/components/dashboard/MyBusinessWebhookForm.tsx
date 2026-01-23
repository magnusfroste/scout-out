
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MyBusinessWebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
  showDescription?: boolean;
}

const MyBusinessWebhookForm: React.FC<MyBusinessWebhookFormProps> = ({
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
        <Label htmlFor="profileWebhookUrl">Profile Webhook URL</Label>
        <div className="flex gap-2">
          <Input
            id="profileWebhookUrl"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your profile webhook URL"
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
            Enter the URL for your profile webhook endpoint. This is used for analyzing your business website.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyBusinessWebhookForm;
