
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const HubspotLogging = () => {
  const [hubspotBccAddress, setHubspotBccAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHubspotBccAddress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_email_settings')
          .select('hubspot_bcc_address')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data?.hubspot_bcc_address) {
          setHubspotBccAddress(data.hubspot_bcc_address);
        }
      } catch (error) {
        console.error('Error fetching Hubspot BCC address:', error);
        toast({
          title: 'Error',
          description: 'Failed to retrieve Hubspot BCC address',
          variant: 'destructive'
        });
      }
    };

    fetchHubspotBccAddress();
  }, [user]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Hubspot BCC address has been copied.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the address manually.",
        variant: "destructive",
      });
    }
  };

  const saveHubspotBccAddress = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_email_settings')
        .update({ hubspot_bcc_address: hubspotBccAddress })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hubspot BCC address saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving Hubspot BCC address:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Hubspot BCC address',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Manual Email Logging</CardTitle>
        <CardDescription>
          Log emails manually by BCCing this Hubspot email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Hubspot BCC Address</h3>
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input 
                value={hubspotBccAddress}
                onChange={(e) => setHubspotBccAddress(e.target.value)}
                placeholder="Enter your Hubspot BCC email address"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={saveHubspotBccAddress}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {hubspotBccAddress || 'No BCC address set'}
              </code>
              {hubspotBccAddress && (
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(hubspotBccAddress)}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-2">Copy</span>
                </Button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(true)}
              >
                {hubspotBccAddress ? 'Edit' : 'Add'}
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            BCC this address when sending emails to log them in HubSpot.
            Contacts will be created or updated automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
