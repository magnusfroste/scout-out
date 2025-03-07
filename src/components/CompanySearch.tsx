
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [proxyMethod, setProxyMethod] = useState('direct'); // 'direct', 'allorigins', 'corsanywhere'
  const { user } = useAuth();
  const { toast } = useToast();

  // Save webhook URL to localStorage when it changes
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

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
      let response;
      
      // Format the URL with query parameter
      const queryParam = `company=${encodeURIComponent(companyName)}`;
      const fullUrl = webhookUrl.includes('?') 
        ? `${webhookUrl}&${queryParam}`
        : `${webhookUrl}?${queryParam}`;
      
      console.log("Full URL:", fullUrl);
      
      // Different proxy approaches with GET method
      if (proxyMethod === 'direct') {
        // Direct approach (will likely fail due to CORS)
        response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
      } else if (proxyMethod === 'allorigins') {
        // Using allorigins proxy
        const encodedUrl = encodeURIComponent(fullUrl);
        response = await fetch(`https://api.allorigins.win/raw?url=${encodedUrl}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
      } else if (proxyMethod === 'corsanywhere') {
        // Using CORS Anywhere proxy
        response = await fetch(`https://cors-anywhere.herokuapp.com/${fullUrl}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          }
        });
      } else {
        throw new Error('Invalid proxy method selected');
      }
      
      console.log("Webhook response status:", response.status);
      
      let responseData;
      // Try to parse as JSON, fall back to text if not JSON
      try {
        responseData = await response.json();
      } catch (e) {
        // If not JSON, get as text
        const text = await response.text();
        responseData = { response: text };
      }

      console.log("Response data:", responseData);
      setResult(responseData);
      
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
              <Label htmlFor="proxyMethod">CORS Method</Label>
              <Select 
                value={proxyMethod} 
                onValueChange={setProxyMethod}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CORS method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct (No Proxy)</SelectItem>
                  <SelectItem value="allorigins">AllOrigins Proxy</SelectItem>
                  <SelectItem value="corsanywhere">CORS Anywhere</SelectItem>
                </SelectContent>
              </Select>
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
