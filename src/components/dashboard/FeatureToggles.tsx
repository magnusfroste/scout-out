import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Plug, Info, Loader2 } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useToast } from '@/hooks/use-toast';

const FeatureToggles: React.FC = () => {
  const { flags, loading, updateFlag } = useFeatureFlags();
  const { toast } = useToast();
  const [updating, setUpdating] = React.useState<string | null>(null);

  const handleToggle = async (key: string, currentValue: boolean) => {
    setUpdating(key);
    const success = await updateFlag(key, !currentValue);
    
    if (success) {
      toast({
        title: "Inställning uppdaterad",
        description: `${key === 'email_module_enabled' ? 'Email-modul' : 'Composio MCP'} är nu ${!currentValue ? 'aktiverad' : 'inaktiverad'}.`,
      });
    } else {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera inställningen.",
        variant: "destructive"
      });
    }
    
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Dessa inställningar påverkar alla användare. När en modul är avstängd visas alternativa funktioner (t.ex. copy-paste för email).
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Email Module Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="email-toggle" className="text-base font-medium">
                    Email-modul
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aktiverar email-integration, OAuth och SendEmailButton
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {updating === 'email_module_enabled' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Switch
                  id="email-toggle"
                  checked={flags.emailModuleEnabled}
                  onCheckedChange={() => handleToggle('email_module_enabled', flags.emailModuleEnabled)}
                  disabled={updating !== null}
                />
              </div>
            </div>
            {!flags.emailModuleEnabled && (
              <div className="mt-3 text-xs text-muted-foreground bg-muted rounded p-2">
                När avstängd: Användare ser copy-paste-knappar istället för "Skicka email"-knappen.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Composio MCP Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plug className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="mcp-toggle" className="text-base font-medium">
                    Composio MCP
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aktiverar Composio MCP-integration och testverktyg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {updating === 'composio_mcp_enabled' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Switch
                  id="mcp-toggle"
                  checked={flags.composioMcpEnabled}
                  onCheckedChange={() => handleToggle('composio_mcp_enabled', flags.composioMcpEnabled)}
                  disabled={updating !== null}
                />
              </div>
            </div>
            {!flags.composioMcpEnabled && (
              <div className="mt-3 text-xs text-muted-foreground bg-muted rounded p-2">
                När avstängd: MCP Testing-fliken döljs från admin-inställningar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureToggles;
