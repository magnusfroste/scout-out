
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Save webhook URL to localStorage when it changes
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  const saveSearchToDatabase = async (companyName: string, result: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('company_searches')
        .insert({
          user_id: user.id,
          company_name: companyName,
          result: result
        });
        
      if (error) throw error;
      
      console.log('Search saved to database');
    } catch (error: any) {
      console.error('Error saving search to database:', error);
      toast({
        title: "Error",
        description: "Failed to save search history",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Format the URL with query parameter
      const queryParam = `company=${encodeURIComponent(companyName)}`;
      const fullUrl = webhookUrl.includes('?') 
        ? `${webhookUrl}&${queryParam}`
        : `${webhookUrl}?${queryParam}`;
      
      console.log("Full URL:", fullUrl);
      
      // Direct approach for GET request
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("Webhook response status:", response.status);
      
      // Get the response text first
      const responseText = await response.text();
      
      // Try to parse as JSON, fall back to text if not JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If not valid JSON, use text as is
        responseData = { response: responseText };
      }

      console.log("Response data:", responseData);
      setResult(responseData);
      
      // Save search to database
      if (user) {
        await saveSearchToDatabase(companyName, responseData);
      }
      
      toast({
        title: "Success",
        description: "Webhook called successfully",
      });
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      setResult({ error: error.message || "Failed to call webhook" });
      
      toast({
        title: "Error",
        description: error.message || "Failed to call webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter your webhook URL"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Example: https://agent.froste.eu/webhook/lovable
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Will be sent as "?company=yourCompanyName" parameter
              </p>
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px]">
              <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanySearch;
