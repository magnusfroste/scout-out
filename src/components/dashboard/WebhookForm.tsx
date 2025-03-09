
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
}

const WebhookForm: React.FC<WebhookFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  isDisabled
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
      <p className="text-xs text-muted-foreground">
        Example: https://agent.froste.eu/webhook/lovable
      </p>
    </div>
  );
};

export default WebhookForm;
