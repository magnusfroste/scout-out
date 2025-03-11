
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
      if (!user || !userProfile?.is_admin) return;
      
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
      }
    };

    // Only attempt to load settings if the user is logged in, is admin, and not currently loading
    if (user && userProfile?.is_admin) {
      loadWebhookSettings();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [loading, user, userProfile]);

  // Show loading state while fetching auth information
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-lg">Loading settings...</p>
      </div>
    );
  }

  // Only redirect after loading is complete
  if (!loading && (!user || !userProfile?.is_admin)) {
    toast({
      title: "Access Denied",
      description: "You need admin privileges to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  const handleWebhookUpdate = async (newUrl: string) => {
    try {
      const success = await updateWebhookSettings(newUrl);
      if (success) {
        setWebhookUrl(newUrl);
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
