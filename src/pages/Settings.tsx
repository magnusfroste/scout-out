import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EmailSettings from '@/components/dashboard/EmailSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Mail } from 'lucide-react';
import ComposioMCPTest from '@/components/dashboard/ComposioMCPTest';
import FeatureToggles from '@/components/dashboard/FeatureToggles';
import HubspotLogging from '@/components/dashboard/email-settings/HubspotLogging';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const Settings = () => {
  const { user, loading, userProfile } = useAuth();
  const { flags, loading: flagsLoading } = useFeatureFlags();

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
              <TabsTrigger value="user">Användarinställningar</TabsTrigger>
              {userProfile?.is_admin && (
                <TabsTrigger value="features">Funktioner</TabsTrigger>
              )}
              {userProfile?.is_admin && (
                <TabsTrigger value="admin">Admin</TabsTrigger>
              )}
              {userProfile?.is_admin && flags.composioMcpEnabled && (
                <TabsTrigger value="mcp-test">MCP Testing</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="user" className="space-y-8">
              {flags.emailModuleEnabled ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Integration</CardTitle>
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
                        Email-modulen är för närvarande inaktiverad. Använd copy-paste för att skicka mail via Hubspot.
                      </AlertDescription>
                    </Alert>
                    <HubspotLogging />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {userProfile?.is_admin && (
              <TabsContent value="features" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Funktions-toggles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeatureToggles />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
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
            
            {userProfile?.is_admin && flags.composioMcpEnabled && (
              <TabsContent value="mcp-test" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Composio MCP Integration Testing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComposioMCPTest />
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