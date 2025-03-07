
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface CompanySearchResult {
  id: string;
  company_name: string;
  result: any;
  created_at: string;
  user_id: string;
}

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CompanySearchResult | null>(null);
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

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to search for companies",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Calling edge function with:", { companyName, userId: user.id, webhookUrl });
      
      // Call the Supabase Edge Function with webhook URL
      const { data, error } = await supabase.functions.invoke("trigger-n8n-workflow", {
        body: { companyName, userId: user.id, webhookUrl },
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      console.log("Edge function response:", data);

      toast({
        title: "Success",
        description: "Company information retrieved successfully",
      });

      // Fetch the latest search results
      await fetchSearchResults();
      setCompanyName('');
    } catch (error: any) {
      console.error("Error searching company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to retrieve company information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    if (!user) return;

    try {
      console.log("Fetching search results for user:", user.id);
      
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error from Supabase query:", error);
        throw error;
      }

      console.log("Fetched search results:", data);
      setSearchResults(data as CompanySearchResult[] || []);
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      toast({
        title: "Error",
        description: "Failed to load your previous searches",
        variant: "destructive",
      });
    }
  };

  // Fetch search results on component mount
  useEffect(() => {
    if (user) {
      fetchSearchResults();
    }
  }, [user]);

  const handleResultClick = (result: CompanySearchResult) => {
    setSelectedResult(result);
  };

  // Format timestamp to a readable date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to determine if an object has any content
  const hasContent = (obj: any): boolean => {
    if (!obj) return false;
    return Object.keys(obj).length > 0;
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
              <p className="text-sm text-muted-foreground">
                This is the URL of your webhook that will process the company name.
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

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-md border cursor-pointer transition-colors ${
                    selectedResult?.id === result.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <h4 className="font-medium">{result.company_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(result.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedResult && hasContent(selectedResult.result) && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results for {selectedResult.company_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px]">
              <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {JSON.stringify(selectedResult.result, null, 2)}
              </pre>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedResult(null)}
              size="sm"
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CompanySearch;
