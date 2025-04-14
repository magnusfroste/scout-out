
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Mail,
  Server, 
  Key,
  Save,
  Trash2,
  Settings as SettingsIcon,
  Plus,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EmailSettings {
  id: string;
  user_id: string;
  email_address: string;
  app_password: string;
  email_provider: string;
  smtp_host: string;
  smtp_port: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmailSettings = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailProvider, setEmailProvider] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  
  const [existingSettings, setExistingSettings] = useState<EmailSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmailSettings();
    }
  }, [user]);

  const fetchEmailSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_email_settings');
      
      if (error) throw error;
      
      console.log('Fetched email settings:', data);
      
      if (data && data.length > 0) {
        const settings = data[0];
        setExistingSettings(settings);
        setEmailAddress(settings.email_address);
        setEmailProvider(settings.email_provider);
        setSmtpHost(settings.smtp_host);
        setSmtpPort(settings.smtp_port.toString());
        // We don't set the password field from DB for security reasons
      } else {
        setExistingSettings(null);
        resetForm();
      }
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email settings: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailAddress('');
    setEmailPassword('');
    setEmailProvider('');
    setSmtpHost('');
    setSmtpPort('');
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    if (!emailAddress || !emailProvider || !smtpHost || !smtpPort) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (!existingSettings && !emailPassword) {
      toast({
        title: 'Missing Password',
        description: 'Please provide an app password',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const settingsData = {
        email_address: emailAddress,
        email_provider: emailProvider,
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort),
        is_active: true,
        user_id: user.id
      };
      
      if (emailPassword) {
        (settingsData as any).app_password = emailPassword;
      }
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('user_email_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
          .eq('user_id', user.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('user_email_settings')
          .insert(settingsData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: `Email settings ${existingSettings ? 'updated' : 'saved'} successfully`,
      });
      
      fetchEmailSettings();
      setEmailPassword('');
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSettings = async () => {
    if (!user || !existingSettings) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('user_email_settings')
        .delete()
        .eq('id', existingSettings.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Email settings deleted successfully',
      });
      
      setExistingSettings(null);
      resetForm();
    } catch (error: any) {
      console.error('Error deleting email settings:', error);
      toast({
        title: 'Error',
        description: `Failed to delete email settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          Email Settings
        </CardTitle>
        <CardDescription>
          Configure your email account to send emails directly from the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emailAddress"
                    placeholder="your-email@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select value={emailProvider} onValueChange={setEmailProvider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailPassword">
                App Password {existingSettings ? '(Leave blank to keep current password)' : ''}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emailPassword"
                  type="password"
                  placeholder="App password (not your regular email password)"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use an app-specific password, not your main account password. 
                <a 
                  href="https://support.google.com/mail/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  How to generate an app password
                </a>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="smtpHost"
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  placeholder="587"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value.replace(/\D/g, ''))}
                  type="number"
                />
              </div>
            </div>
            
            {existingSettings && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Email settings configured</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You can now send emails directly from the app using {existingSettings.email_address}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {existingSettings ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || isSaving}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Settings
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Email Settings</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your email settings? You won't be able to send emails until you configure new settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSettings} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button onClick={handleSaveSettings} disabled={isSaving || isDeleting}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Settings
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={handleSaveSettings} disabled={isSaving} className="ml-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailSettings;
