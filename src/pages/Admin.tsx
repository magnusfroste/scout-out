import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import ComposioMCPTest from '@/components/dashboard/ComposioMCPTest';
import FeatureToggles from '@/components/dashboard/FeatureToggles';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const Admin = () => {
  const { user, loading, userProfile } = useAuth();
  const { flags, loading: flagsLoading } = useFeatureFlags();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-muted-foreground">Laddar...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Admin</h1>
          <p className="text-muted-foreground mb-8">Hantera applikationsinställningar och moduler</p>
          
          <Tabs defaultValue="modules">
            <TabsList className="mb-6">
              <TabsTrigger value="modules">Moduler</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              {flags.composioMcpEnabled && (
                <TabsTrigger value="mcp-test">MCP Testing</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="modules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funktionsmoduler</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeatureToggles />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>n8n Webhook URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Dessa webhook URLs är konfigurerade via Supabase Edge Function secrets. 
                      De används för att kommunicera med n8n workflows.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4 mt-4">
                    <WebhookUrlItem 
                      label="Step 1: My Business"
                      secretName="MYBUSINESS_WEBHOOK_URL"
                      description="Skickar företagsinformation för analys"
                    />
                    <WebhookUrlItem 
                      label="Step 2: Questions"
                      secretName="QUESTIONS_WEBHOOK_URL"
                      description="Genererar anpassade frågor baserat på företagsprofil"
                    />
                    <WebhookUrlItem 
                      label="Step 3: Company Research"
                      secretName="COMPANY_RESEARCH_WEBHOOK_URL"
                      description="Utför research på målföretag"
                    />
                    <WebhookUrlItem 
                      label="Step 4: Value Proposition"
                      secretName="VALUE_PROPOSITION_WEBHOOK_URL"
                      description="Genererar value proposition och email-innehåll"
                    />
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <a 
                      href="https://supabase.com/dashboard/project/pqskutdrekcinpymvigm/settings/functions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Konfigurera secrets i Supabase Dashboard
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {flags.composioMcpEnabled && (
              <TabsContent value="mcp-test" className="space-y-6">
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

interface WebhookUrlItemProps {
  label: string;
  secretName: string;
  description: string;
}

const WebhookUrlItem = ({ label, secretName, description }: WebhookUrlItemProps) => (
  <div className="p-4 rounded-lg border bg-muted/30">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <code className="text-xs bg-muted px-2 py-1 rounded shrink-0">
        {secretName}
      </code>
    </div>
  </div>
);

export default Admin;
