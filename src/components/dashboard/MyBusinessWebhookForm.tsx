
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  return (
    <div className="space-y-2">
      <Label htmlFor="myBusinessWebhookUrl">My Business Webhook URL</Label>
      <Input
        id="myBusinessWebhookUrl"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        placeholder="Enter your My Business webhook URL"
        disabled={isDisabled}
      />
      {showDescription && (
        <p className="text-xs text-muted-foreground">
          Enter the URL for your My Business webhook endpoint
        </p>
      )}
    </div>
  );
};

export default MyBusinessWebhookForm;
