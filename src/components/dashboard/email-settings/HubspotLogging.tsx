
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HUBSPOT_BCC_ADDRESS = '49169316@bcc.hubspot.com';
const HUBSPOT_FORWARD_ADDRESS = '49169316@forward.hubspot.com';

export const HubspotLogging = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'BCC' | 'Forwarding') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} address has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the address manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Manual Email Logging</CardTitle>
        <CardDescription>
          Log outgoing and incoming emails manually by including these email addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">BCC Address (Outgoing)</h3>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {HUBSPOT_BCC_ADDRESS}
            </code>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(HUBSPOT_BCC_ADDRESS, 'BCC')}
            >
              <Copy className="h-4 w-4" />
              <span className="ml-2">Copy</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            BCC this email address when you send an email to log outgoing emails in your CRM. 
            Emails BCCed to this address will be attached to any matching contacts.
            If no contact is found, a new one will be created.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Forwarding Address (Incoming)</h3>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {HUBSPOT_FORWARD_ADDRESS}
            </code>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(HUBSPOT_FORWARD_ADDRESS, 'Forwarding')}
            >
              <Copy className="h-4 w-4" />
              <span className="ml-2">Copy</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Forward emails to this address to log incoming emails in your CRM. 
            Emails forwarded to this address will be attached to any matching contacts. 
            If no contact is found, a new one will be created.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
