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
        title: "Setting updated",
        description: `${key === 'email_module_enabled' ? 'Email module' : 'Composio MCP'} is now ${!currentValue ? 'enabled' : 'disabled'}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Could not update setting.",
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
          These settings affect all users. When a module is disabled, alternative features are shown (e.g., copy-paste for email).
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
                    Email Module
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enables email integration, OAuth and SendEmailButton
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
                When disabled: Users see copy-paste buttons instead of "Send email" button.
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
                    Enables Composio MCP integration and test tools
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
                When disabled: MCP Testing tab is hidden from admin settings.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureToggles;
