import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiateO365AuthShared, handleO365AuthCallbackShared, handleSharedOAuthError } from '@/services/oauth/sharedOAuthFlowService';
import { saveOAuth2Tokens } from '@/services/oauth/tokenService';
import { supabase } from '@/integrations/supabase/client';

const SimpleConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    // Check if this is a callback from Microsoft OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (error) {
      console.error('OAuth error from Microsoft:', error);
      toast({
        title: "Connection Failed",
        description: `Authentication failed: ${error}`,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    setIsProcessingCallback(true);
    
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      const redirectUri = `${window.location.origin}/simple-connect`;
      
      toast({
        title: "Processing Connection",
        description: "Exchanging authorization code for tokens...",
      });

      // Exchange code for tokens using shared app
      const result = await handleO365AuthCallbackShared(code, redirectUri);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to obtain tokens');
      }

      toast({
        title: "Saving Configuration",
        description: "Storing your OAuth tokens securely...",
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get email address from session storage (should be set by parent component)
      const emailAddress = sessionStorage.getItem('oauth_email_address');
      if (!emailAddress) {
        throw new Error('Email address not found. Please try again from the settings page.');
      }

      // Save tokens to database with connection_type = 'shared'
      const saveResult = await saveOAuth2Tokens(
        user.id,
        result.data.refreshToken,
        'SHARED_APP', // Client ID placeholder for shared app
        'SHARED_SECRET', // Client secret placeholder for shared app
        emailAddress
      );

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save OAuth tokens');
      }

      // Update the record to mark it as shared connection
      const { error: updateError } = await supabase
        .from('user_email_settings')
        .update({ connection_type: 'shared' })
        .eq('user_id', user.id)
        .eq('email_address', emailAddress);

      if (updateError) {
        console.error('Failed to update connection type:', updateError);
        // Don't throw here as the main flow succeeded
      }

      toast({
        title: "Success!",
        description: "Your Office 365 email has been connected successfully using our shared app.",
      });

      // Clean up session storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_email_address');
      sessionStorage.removeItem('oauth_redirect_url');
      sessionStorage.removeItem('oauth_flow_type');

      // Clean up URL and redirect to settings
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        navigate('/settings');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      const errorMessage = handleSharedOAuthError(error);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setIsProcessingCallback(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get current user to ensure they're authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect your Office 365 email.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // For shared app, we need to get the email address from the user
      // This would typically come from a form or be pre-filled
      const emailAddress = prompt('Please enter your Office 365 email address:');
      if (!emailAddress) {
        setIsConnecting(false);
        return;
      }

      // Store email address for callback processing
      sessionStorage.setItem('oauth_email_address', emailAddress);

      toast({
        title: "Connecting...",
        description: "Redirecting to Microsoft for authentication...",
      });

      // Start the shared OAuth flow
      initiateO365AuthShared();
      
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to start the connection process. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  if (isProcessingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <h3 className="text-lg font-semibold">Processing Connection</h3>
              <p className="text-center text-muted-foreground">
                Please wait while we complete your Office 365 setup...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Connect Office 365</CardTitle>
          <CardDescription>
            Connect your Office 365 email in seconds with our simple one-click setup.
            No technical configuration required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Secure OAuth 2.0 authentication</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">No app registration needed</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Works with any Office 365 account</span>
            </div>
          </div>
          
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Connect Office 365
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/settings')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to Settings
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <p>
              Need advanced setup options? Use the{' '}
              <button 
                onClick={() => navigate('/settings')}
                className="text-blue-600 hover:underline"
              >
                Advanced Setup
              </button>{' '}
              instead.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleConnect;