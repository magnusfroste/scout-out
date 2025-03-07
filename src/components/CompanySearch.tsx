
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanySearchResult {
  id: string;
  company_name: string;
  result: any;
  created_at: string;
  user_id: string;
}

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CompanySearchResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("trigger-n8n-workflow", {
        body: { companyName, userId: user.id },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company information retrieved successfully",
      });

      // Fetch the latest search results
      fetchSearchResults();
      setCompanyName('');
    } catch (error) {
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
      // Using 'company_searches' table instead of 'profiles'
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensuring we're using the correct type for the results
      setSearchResults(data as CompanySearchResult[] || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast({
        title: "Error",
        description: "Failed to load your previous searches",
        variant: "destructive",
      });
    }
  };

  // Fetch search results on component mount
  React.useEffect(() => {
    fetchSearchResults();
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
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-4">Company Information Search</h3>
        <form onSubmit={handleSearch} className="space-y-4">
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
          <Button type="submit" isLoading={isLoading}>
            Search
          </Button>
        </form>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-4">Your Recent Searches</h3>
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
        </div>
      )}

      {selectedResult && hasContent(selectedResult.result) && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Results for {selectedResult.company_name}
            </h3>
            <Button
              variant="ghost"
              onClick={() => setSelectedResult(null)}
              size="sm"
            >
              Close
            </Button>
          </div>
          <div className="overflow-auto max-h-[500px]">
            <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
              {JSON.stringify(selectedResult.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
