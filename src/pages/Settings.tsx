
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WebhookForm from '@/components/dashboard/WebhookForm';
import MyBusinessWebhookForm from '@/components/dashboard/MyBusinessWebhookForm';
import ValuePropositionWebhookForm from '@/components/dashboard/ValuePropositionWebhookForm';
import EmailSettings from '@/components/dashboard/EmailSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  fetchWebhookSettings, 
  updateWebhookSettings, 
  updateMyBusinessWebhookSettings,
  updateValuePropositionWebhookSettings,
  updateCompanyResearchWebhookSettings
} from '@/services/webhookService';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, loading, userProfile } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [myBusinessWebhookUrl, setMyBusinessWebhookUrl] = useState('');
  const [valuePropositionWebhookUrl, setValuePropositionWebhookUrl] = useState('');
  const [companyResearchWebhookUrl, setCompanyResearchWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && userProfile?.is_admin) {
        console.log('User is admin, loading webhook settings');
        loadWebhookSettings();
      } else {
        console.log('User is not admin or not logged in');
        setIsLoading(false);
        setAdminChecked(true);
      }
    }
  }, [loading, user, userProfile]);

  const loadWebhookSettings = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching webhook settings...');
      const settings = await fetchWebhookSettings();
      console.log('Webhook settings received:', settings);
      
      if (settings) {
        // 'url' is used for Company Research (Step 3)
        // There is no separate column for Questions webhook (Step 2) in the database
        setWebhookUrl(settings.url || '');
        setMyBusinessWebhookUrl(settings.mybusiness_url || '');
        setValuePropositionWebhookUrl(settings.value_proposition_url || '');
        setCompanyResearchWebhookUrl(settings.url || '');
        console.log(`Set webhook URL (Step 2 & 3): ${settings.url}`);
        console.log(`Set mybusiness URL (Step 1): ${settings.mybusiness_url}`);
        console.log(`Set value proposition URL (Step 4): ${settings.value_proposition_url}`);
      } else {
        console.warn('No webhook settings found');
        toast({
          title: "Information",
          description: "No webhook settings found. You can create them now.",
        });
      }
    } catch (error) {
      console.error('Error loading webhook settings:', error);
      toast({
        title: "Error",
        description: "Failed to load webhook settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAdminChecked(true);
    }
  };

  if (loading || (isLoading && !adminChecked)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading settings...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    console.log('User not logged in, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const handleWebhookUpdate = async (newUrl: string) => {
    try {
      // This updates the 'url' column which is used for both Step 2 (Questions) and Step 3 (Company Research)
      const success = await updateWebhookSettings(newUrl);
      if (success) {
        setWebhookUrl(newUrl);
        setCompanyResearchWebhookUrl(newUrl);
      }
    } catch (error) {
      console.error('Error updating webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to update webhook URL",
        variant: "destructive",
      });
    }
  };

  const handleMyBusinessWebhookUpdate = async (newUrl: string) => {
    try {
      const success = await updateMyBusinessWebhookSettings(newUrl);
      if (success) {
        setMyBusinessWebhookUrl(newUrl);
      }
    } catch (error) {
      console.error('Error updating My Business webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to update My Business webhook URL",
        variant: "destructive",
      });
    }
  };

  const handleValuePropositionWebhookUpdate = async (newUrl: string) => {
    try {
      const success = await updateValuePropositionWebhookSettings(newUrl);
      if (success) {
        setValuePropositionWebhookUrl(newUrl);
      }
    } catch (error) {
      console.error('Error updating Value Proposition webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to update Value Proposition webhook URL",
        variant: "destructive",
      });
    }
  };

  const handleCompanyResearchWebhookUpdate = async (newUrl: string) => {
    try {
      // This also updates the 'url' column which is shared with Step 2 (Questions)
      const success = await updateCompanyResearchWebhookSettings(newUrl);
      if (success) {
        setCompanyResearchWebhookUrl(newUrl);
        setWebhookUrl(newUrl);
      }
    } catch (error) {
      console.error('Error updating Company Research webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to update Company Research webhook URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <Tabs defaultValue="user">
            <TabsList className="mb-6">
              <TabsTrigger value="user">User Settings</TabsTrigger>
              {userProfile?.is_admin && (
                <TabsTrigger value="admin">Admin Settings</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="user" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Email Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmailSettings />
                </CardContent>
              </Card>
            </TabsContent>
            
            {userProfile?.is_admin && (
              <TabsContent value="admin" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: My Business Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MyBusinessWebhookForm 
                      webhookUrl={myBusinessWebhookUrl}
                      setWebhookUrl={handleMyBusinessWebhookUpdate}
                      isDisabled={isLoading}
                      showDescription={true}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Questions Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebhookForm 
                      webhookUrl={webhookUrl}
                      setWebhookUrl={handleWebhookUpdate}
                      isDisabled={isLoading}
                      showDescription={true}
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      This URL is shared with Step 3 (Company Research). Changing this affects both steps.
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Company Research Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="companyResearchWebhookUrl" className="text-sm font-medium">
                          Company Research Webhook URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="companyResearchWebhookUrl"
                            type="text"
                            value={companyResearchWebhookUrl}
                            onChange={(e) => setCompanyResearchWebhookUrl(e.target.value)}
                            placeholder="Enter company research webhook URL"
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 border border-input bg-transparent rounded-md"
                          />
                          <button
                            onClick={() => handleCompanyResearchWebhookUpdate(companyResearchWebhookUrl)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>URL for the company research webhook used in Step 3.</p>
                          <p className="mt-1 font-semibold">
                            Note: This updates the same field as the Questions webhook (Step 2).
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Value Proposition Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ValuePropositionWebhookForm 
                      webhookUrl={valuePropositionWebhookUrl}
                      setWebhookUrl={handleValuePropositionWebhookUpdate}
                      isDisabled={isLoading}
                      showDescription={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
