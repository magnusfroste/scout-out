
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
        } else {
          // Set a default webhook URL or handle missing URL silently
          console.log("No webhook URL configured");
        }
      } catch (error) {
        console.error('Error loading webhook settings:', error);
        // Silently handle the error - no toast here
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
      // Silently handle missing webhook URL
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
    
    if (!user || !userProfile) return;
    
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
      
      const directResponse = await callCompanyWebhook(webhookUrl, companyName, questions);
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const responseData = await directResponse.json();
      
      const { processedResults, contactInfo } = parseWebhookResponse(responseData);
      
      setResult({
        results: processedResults,
        contact_info: contactInfo
      });
      
      if (user.id) {
        const storageSuccess = await storeSearchResults(
          user.id, 
          companyName, 
          responseData, 
          processedResults, 
          contactInfo
        );
        
        if (storageSuccess) {
          console.log("Successfully stored search results to database");
          onSearch(); // Trigger refetch of searches
        } else {
          console.warn("Failed to store search results to database");
          // No toast for failed storage
        }
      }
      
      toast({
        title: "Success",
        description: "Questions answered successfully",
      });
      
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      
      // Only show one focused error message instead of multiple system errors
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
