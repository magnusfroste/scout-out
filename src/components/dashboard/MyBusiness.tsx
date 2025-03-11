
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BusinessData {
  summary: string;
  salesInfo: string;
}

const MyBusiness = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState<string>(userProfile?.website_url || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [salesInfo, setSalesInfo] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://agent.froste.eu/webhook/mybusiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          website: websiteUrl 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setBusinessData(data);
      setSalesInfo(data.salesInfo || '');
      
      // Save the website URL to user profile
      if (user && websiteUrl !== userProfile?.website_url) {
        await updateProfile({ website_url: websiteUrl });
      }

      toast({
        title: "Success",
        description: "Your business website has been analyzed",
      });
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your business website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSalesInfo = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save the sales info to user profile
      await updateProfile({ sales_info: salesInfo });
      
      toast({
        title: "Success",
        description: "Your sales information has been saved",
      });
    } catch (error) {
      console.error('Error saving sales info:', error);
      toast({
        title: "Error",
        description: "Failed to save your sales information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Business Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Your Business Website</Label>
              <div className="flex gap-2">
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyzeWebsite} 
                  disabled={isLoading}
                >
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your business website URL to generate a summary and sales information
              </p>
            </div>

            {businessData && (
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Business Summary</Label>
                  <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {businessData.summary}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesInfo">Sales Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the generated sales information before saving
                  </p>
                  <Textarea
                    id="salesInfo"
                    value={salesInfo}
                    onChange={(e) => setSalesInfo(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        {businessData && (
          <CardFooter>
            <Button 
              onClick={handleSaveSalesInfo} 
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? "Saving..." : "Save Sales Information"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MyBusiness;
