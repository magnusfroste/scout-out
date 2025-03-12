
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import { storeSearchResults } from '@/services/companySearchService';
import { callCompanyWebhook } from '@/services/companyWebhookService';
import { Question, SearchResultType } from '@/types/company';

export const useCompanySearch = (questions: Question[], onSearch: () => void) => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [isDeductingCredit, setIsDeductingCredit] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [searchRequested, setSearchRequested] = useState(false);
  const [searchId, setSearchId] = useState(`initial-${Date.now()}`);
  
  const previousResultRef = useRef<SearchResultType | null>(null);
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  // Load webhook URL on component mount
  useEffect(() => {
    const loadWebhookUrl = async () => {
      setIsLoadingWebhook(true);
      try {
        const settings = await fetchWebhookSettings();
        if (settings?.url) {
          setWebhookUrl(settings.url);
          console.log("Loaded webhook URL:", settings.url);
        } else {
          console.log("No webhook URL configured");
        }
      } catch (error) {
        console.error('Error loading webhook settings:', error);
      } finally {
        setIsLoadingWebhook(false);
      }
    };
    loadWebhookUrl();
  }, []);

  // Memoized search handler to prevent recreation on each render
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl) {
      console.error("Webhook URL not configured");
      toast({
        title: "System Error",
        description: "The service is currently unavailable. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const questionsCount = questions.length;
    const creditCost = calculateCreditCost(questionsCount);
    
    if (!user || !userProfile) {
      console.error("User or user profile is missing", { user, userProfile });
      return;
    }
    
    setIsDeductingCredit(true);
    
    const creditSuccess = await deductCredits(
      user.id, 
      userProfile.credits, 
      creditCost, 
      `Company search: ${companyName}`,
      refreshUserProfile
    );
    
    setIsDeductingCredit(false);
    
    if (!creditSuccess) {
      return;
    }

    // Save the current result before starting a new search
    previousResultRef.current = result;

    // Create a unique search ID for this search operation
    const newSearchId = `search-${companyName}-${Date.now()}`;
    setSearchId(newSearchId);
    console.log(`Creating new search with ID: ${newSearchId}`);

    // Set searchRequested to true if it's not already
    if (!searchRequested) {
      setSearchRequested(true);
    }
    
    // Start loading
    setIsLoading(true);

    try {
      console.log("Making webhook call to:", webhookUrl);
      console.log("Searching for company:", companyName);
      
      const startTime = new Date().getTime();
      const directResponse = await callCompanyWebhook(webhookUrl, companyName, questions);
      const endTime = new Date().getTime();
      console.log(`Webhook response time: ${(endTime - startTime) / 1000} seconds`);
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const responseData = await directResponse.json();
      console.log("Webhook raw response:", JSON.stringify(responseData));
      
      const parseResult = parseWebhookResponse(responseData);
      console.log("Parsed webhook response:", JSON.stringify(parseResult));
      
      const { processedResults, contactInfo } = parseResult;
      
      // Create the search result object
      const searchResult: SearchResultType = {
        results: processedResults || [],
        contact_info: contactInfo
      };
      
      // Update the result
      setResult(searchResult);
      
      if (user.id) {
        console.log("Storing search results for user:", user.id);
        const storageSuccess = await storeSearchResults(
          user.id, 
          companyName, 
          responseData, 
          processedResults || [], 
          contactInfo
        );
        
        if (storageSuccess) {
          console.log("Successfully stored search results");
          onSearch(); // Trigger refetch of searches
        } else {
          console.warn("Failed to store search results");
        }
      }
      
      // Show toast after all state updates are complete
      toast({
        title: "Success",
        description: "Search completed successfully",
      });
      
    } catch (error: any) {
      console.error("Error during company search:", error);
      
      // If there was an error, restore the previous result
      setResult(previousResultRef.current);
      
      toast({
        title: "Error",
        description: "Unable to process your search at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyName, webhookUrl, questions, user, userProfile, refreshUserProfile, toast, onSearch, result, searchRequested]);

  return {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch,
    searchRequested,
    setSearchRequested,
    searchId
  };
};
