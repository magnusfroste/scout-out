
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import { storeSearchResults } from '@/services/companySearchService';
import { callCompanyWebhook } from '@/services/companyWebhookService';
import { Question, SearchResultType } from '@/types/company';

export const useCompanySearch = (
  questions: Question[], 
  onSearch: () => void
) => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [isDeductingCredit, setIsDeductingCredit] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [searchId, setSearchId] = useState<string | null>(null);
  const isMounted = useRef(true);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  // Component lifecycle management
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load webhook URL on component mount
  useEffect(() => {
    const loadWebhookUrl = async () => {
      if (!isMounted.current) return;
      
      setIsLoadingWebhook(true);
      try {
        const settings = await fetchWebhookSettings();
        if (settings?.url && isMounted.current) {
          setWebhookUrl(settings.url);
          console.log("Loaded webhook URL:", settings.url);
        } else {
          console.log("No webhook URL configured");
        }
      } catch (error) {
        console.error('Error loading webhook settings:', error);
      } finally {
        if (isMounted.current) {
          setIsLoadingWebhook(false);
        }
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
    
    // Reset result when starting a new search
    setResult(null);
    setSearchId(null);
    
    // Start loading
    setIsLoading(true);
    setIsDeductingCredit(true);
    
    const creditSuccess = await deductCredits(
      user.id, 
      userProfile.credits, 
      creditCost, 
      `Company search: ${companyName}`,
      refreshUserProfile
    );
    
    if (isMounted.current) {
      setIsDeductingCredit(false);
    }
    
    if (!creditSuccess) {
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

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
      
      // Generate a unique search ID that includes timestamp for uniqueness
      const newSearchId = `search-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Update state only if component is still mounted
      if (isMounted.current) {
        // Set the result and searchId in a single render cycle
        setResult(searchResult);
        setSearchId(newSearchId);
      }
      
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
      
      // Show toast only if component is still mounted
      if (isMounted.current) {
        toast({
          title: "Success",
          description: "Search completed successfully",
        });
      }
      
    } catch (error: any) {
      console.error("Error during company search:", error);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Unable to process your search at this time. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [companyName, webhookUrl, questions, user, userProfile, refreshUserProfile, toast, onSearch]);

  return {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch,
    searchId
  };
};
