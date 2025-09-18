import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EmailSettings from '@/components/dashboard/EmailSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Settings = () => {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
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
                    <CardTitle>Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Webhook URLs are now managed via secure environment variables in Supabase Edge Functions.
                        To configure webhook URLs, update the following secrets in your Supabase project dashboard:
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div><strong>Step 1 (My Business):</strong> MYBUSINESS_WEBHOOK_URL</div>
                      <div><strong>Step 2 (Questions):</strong> QUESTIONS_WEBHOOK_URL</div>
                      <div><strong>Step 3 (Company Research):</strong> COMPANY_RESEARCH_WEBHOOK_URL</div>
                      <div><strong>Step 4 (Value Proposition):</strong> VALUE_PROPOSITION_WEBHOOK_URL</div>
                    </div>
                    
                    <div className="mt-4">
                      <a 
                        href={`https://supabase.com/dashboard/project/pqskutdrekcinpymvigm/settings/functions`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Configure Webhook Secrets →
                      </a>
                    </div>
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