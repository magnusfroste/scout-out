import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EmailSettings from '@/components/dashboard/EmailSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Mail } from 'lucide-react';
import HubspotLogging from '@/components/dashboard/email-settings/HubspotLogging';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const Settings = () => {
  const { user, loading } = useAuth();
  const { flags } = useFeatureFlags();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-muted-foreground">Laddar inställningar...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Inställningar</h1>
          <p className="text-muted-foreground mb-8">Hantera dina personliga inställningar</p>
          
          <div className="space-y-6">
            {flags.emailModuleEnabled ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email-integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmailSettings />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email (Inaktiverad)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Email-modulen är för närvarande inaktiverad. 
                      Använd copy-paste för att skicka mail via Hubspot.
                    </AlertDescription>
                  </Alert>
                  <HubspotLogging />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;