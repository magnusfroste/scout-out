
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
  showDescription?: boolean;
}

const WebhookForm: React.FC<WebhookFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  isDisabled,
  showDescription = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="webhookUrl">Webhook URL</Label>
      <Input
        id="webhookUrl"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        placeholder="Enter your webhook URL"
        disabled={isDisabled}
      />
      {showDescription && (
        <p className="text-xs text-muted-foreground">
          Enter the URL for your webhook endpoint
        </p>
      )}
    </div>
  );
};

export default WebhookForm;
