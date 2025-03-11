
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WebhookForm from '@/components/dashboard/WebhookForm';
import MyBusinessWebhookForm from '@/components/dashboard/MyBusinessWebhookForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchWebhookSettings, updateWebhookSettings, updateMyBusinessWebhookSettings } from '@/services/webhookService';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, loading, userProfile } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [myBusinessWebhookUrl, setMyBusinessWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWebhookSettings = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching webhook settings...');
        const settings = await fetchWebhookSettings();
        console.log('Webhook settings received:', settings);
        
        if (settings) {
          setWebhookUrl(settings.url || '');
          setMyBusinessWebhookUrl(settings.mybusiness_url || '');
          console.log(`Set webhook URL: ${settings.url}`);
          console.log(`Set mybusiness URL: ${settings.mybusiness_url}`);
        } else {
          console.warn('No webhook settings found');
          toast({
            title: "Warning",
            description: "Could not load webhook settings",
            variant: "destructive",
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
      }
    };

    // Only attempt to load settings if the user is not currently loading
    if (!loading) {
      // Only admins should be able to access this page, but we'll load the settings
      // regardless to fix the issue with settings not displaying
      loadWebhookSettings();
    }
  }, [loading]);

  // Redirect if not admin
  if (!loading && (!user || !userProfile?.is_admin)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleWebhookUpdate = async (newUrl: string) => {
    try {
      const success = await updateWebhookSettings(newUrl);
      if (success) {
        setWebhookUrl(newUrl);
        toast({
          title: "Success",
          description: "Webhook URL updated successfully",
        });
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
        toast({
          title: "Success",
          description: "My Business webhook URL updated successfully",
        });
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <WebhookForm 
                  webhookUrl={webhookUrl}
                  setWebhookUrl={handleWebhookUpdate}
                  isDisabled={isLoading}
                  showDescription={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Business Webhook Configuration</CardTitle>
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
