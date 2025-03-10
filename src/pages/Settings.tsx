
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WebhookForm from '@/components/dashboard/WebhookForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchWebhookSettings, updateWebhookSettings } from '@/services/webhookService';

const Settings = () => {
  const { user, loading, userProfile } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWebhookSettings = async () => {
      const settings = await fetchWebhookSettings();
      if (settings) {
        setWebhookUrl(settings.url);
      }
      setIsLoading(false);
    };

    loadWebhookSettings();
  }, []);

  // Redirect if not admin
  if (!loading && (!user || !userProfile?.is_admin)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleWebhookUpdate = async (newUrl: string) => {
    const success = await updateWebhookSettings(newUrl);
    if (success) {
      setWebhookUrl(newUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
          
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
