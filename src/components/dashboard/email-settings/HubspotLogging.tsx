
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// These would normally come from an API or environment variables
// Using placeholder values that match the Hubspot format
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
          Log emails manually by including these HubSpot email addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">BCC Address</h3>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {HUBSPOT_BCC_ADDRESS}
            </code>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(HUBSPOT_BCC_ADDRESS, 'BCC')}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Copy</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            BCC this address when sending emails to log your outgoing emails in HubSpot.
            Contacts will be created or updated automatically.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Forwarding Address</h3>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {HUBSPOT_FORWARD_ADDRESS}
            </code>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(HUBSPOT_FORWARD_ADDRESS, 'Forwarding')}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Copy</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Forward incoming emails to this address to log them in HubSpot.
            This helps track all communication with your contacts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
