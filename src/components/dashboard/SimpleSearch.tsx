import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callCompanyWebhook } from '@/services/companyWebhookService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import { Question, SearchResultType } from '@/types/company';
import QuestionsList from './QuestionsList';
import SearchResults from './SearchResults';

interface SimpleSearchProps {
  questions: Question[];
}

const SimpleSearch: React.FC<SimpleSearchProps> = ({ questions }) => {
  const [companyName, setCompanyName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const { toast } = useToast();

  // Load webhook URL when component mounts - no longer needed as URLs are managed via secrets
  useEffect(() => {
    setIsLoadingWebhook(false);
  }, []);

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

    // Check if webhook URL is available
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Company research webhook URL is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setError(null);
    
    // Don't clear results until we have new ones
    // This keeps the previous results visible during the search
    
    toast({
      title: "Search Started",
      description: "Searching for company data...",
    });
    
    try {
      console.log("Starting simple search for:", companyName);
      console.log("Using webhook URL:", webhookUrl);
      
      // Make the webhook call directly without credit deduction
      const response = await callCompanyWebhook(webhookUrl, companyName, questions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Process the response
      const responseData = await response.json();
      console.log("Webhook response received");
      
      const parseResult = parseWebhookResponse(responseData);
      console.log("Parsed webhook response:", parseResult);
      
      const { processedResults, contactInfo } = parseResult;
      
      // Set the result
      const newResult = {
        results: processedResults || [],
        contact_info: contactInfo
      };
      
      console.log("Setting search results:", newResult);
      setResult(newResult);
      
      toast({
        title: "Search Complete",
        description: "Your search results are ready",
      });
    } catch (error: any) {
      console.error("Error during company search:", error);
      
      setError(error.message || "An error occurred during search");
      
      toast({
        title: "Error",
        description: "Unable to process your search at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      // Add a small delay to ensure UI updates properly
      setTimeout(() => {
        setIsSearching(false);
      }, 1000);
    }
  };

  if (isLoadingWebhook) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading search tools...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Company Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isSearching}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                type="submit" 
                disabled={isSearching || !webhookUrl}
                className={isSearching ? "animate-pulse" : ""}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              <div className="text-sm text-muted-foreground">
                <span>Simple search without credits</span>
              </div>
            </div>
            
            {/* Display webhook URL for debugging */}
            <div className="mt-4 text-xs text-muted-foreground border-t pt-2">
              <p>Webhook URL: {webhookUrl || "Not configured"}</p>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <QuestionsList questions={questions} />
      
      {result && (
        <SearchResults 
          result={result} 
          companyName={companyName} 
          questions={questions} 
        />
      )}
    </div>
  );
};

export default SimpleSearch;
