
import { useState, useEffect } from 'react';
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
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

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

    setIsLoading(true);
    setResult(null);

    try {
      console.log("Making webhook call to:", webhookUrl);
      console.log("Searching for company:", companyName);
      console.log("User ID:", user.id);
      
      const directResponse = await callCompanyWebhook(webhookUrl, companyName, questions);
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const responseData = await directResponse.json();
      console.log("Webhook raw response:", JSON.stringify(responseData));
      
      const parseResult = parseWebhookResponse(responseData);
      console.log("Parsed webhook response:", JSON.stringify(parseResult));
      
      const { processedResults, contactInfo } = parseResult;
      
      if (!processedResults || processedResults.length === 0) {
        console.warn("No processed results found in the webhook response");
      }
      
      // Set the result even if it's empty to show the user something happened
      setResult({
        results: processedResults || [],
        contact_info: contactInfo
      });
      
      if (user.id) {
        console.log("Attempting to store search results for user:", user.id);
        const storageSuccess = await storeSearchResults(
          user.id, 
          companyName, 
          responseData, 
          processedResults || [], 
          contactInfo
        );
        
        if (storageSuccess) {
          console.log("Successfully stored search results to database");
          onSearch(); // Trigger refetch of searches
        } else {
          console.warn("Failed to store search results to database");
        }
      } else {
        console.error("Cannot store results - user.id is not available");
      }
      
      toast({
        title: "Success",
        description: "Search completed successfully",
      });
      
    } catch (error: any) {
      console.error("Error during company search:", error);
      
      toast({
        title: "Error",
        description: "Unable to process your search at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch
  };
};
