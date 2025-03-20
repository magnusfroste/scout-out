import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import { storeSearchResults } from '@/services/companySearchService';
import { callCompanyWebhook, WebhookRequestBody } from '@/services/companyWebhookService';
import { Question, SearchResultType } from '@/types/company';

const DEFAULT_WEBHOOK_URL = 'https://agent.froste.eu/webhook/company';

export enum SearchState {
  IDLE = 'idle',
  SEARCHING = 'searching',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export const useCompanySearch = (questions: Question[], onSearch: () => void) => {
  const [companyName, setCompanyName] = useState('');
  const [searchState, setSearchState] = useState<SearchState>(SearchState.IDLE);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_WEBHOOK_URL);
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingCredits, setIsProcessingCredits] = useState(false);
  
  const isSearchingRef = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  const isLoading = isSearching;
  const isDeductingCredit = isProcessingCredits;

  const creditCost = useMemo(() => calculateCreditCost(questions.length), [questions.length]);

  useEffect(() => {
    const loadWebhookUrl = async () => {
      setIsLoadingWebhook(true);
      try {
        const settings = await fetchWebhookSettings();
        if (settings?.url) {
          setWebhookUrl(settings.url);
          console.log("Loaded webhook URL:", settings.url);
        } else {
          console.log("No webhook URL configured, using default");
          setWebhookUrl(DEFAULT_WEBHOOK_URL);
        }
      } catch (error) {
        console.error('Error loading webhook settings:', error);
        setWebhookUrl(DEFAULT_WEBHOOK_URL);
      } finally {
        setIsLoadingWebhook(false);
      }
    };
    loadWebhookUrl();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [companyName, errorMessage]);

  useEffect(() => {
    if (searchState === SearchState.ERROR || searchState === SearchState.COMPLETED) {
      setSearchState(SearchState.IDLE);
    }
  }, [questions, searchState]);

  const setSearchingStatus = useCallback((status: boolean) => {
    isSearchingRef.current = status;
    setIsSearching(status);
  }, []);

  const processCredits = useCallback(async () => {
    if (!user || !userProfile) {
      console.error("User or user profile is missing", { user, userProfile });
      return false;
    }

    setIsProcessingCredits(true);
    try {
      console.log("Processing credits after successful search");
      
      const creditSuccess = await deductCredits(
        user.id, 
        userProfile.credits, 
        creditCost, 
        `Company search: ${companyName}`,
        refreshUserProfile
      );
      
      if (!creditSuccess) {
        console.error("Failed to deduct credits");
        toast({
          title: "Credit Error",
          description: "Your search was successful, but we couldn't process your credits",
          variant: "destructive",
        });
        return false;
      }

      console.log("Credits deducted successfully");
      toast({
        title: "Credits Deducted",
        description: `${creditCost} credit${creditCost > 1 ? 's were' : ' was'} used for this search`,
      });
      
      return true;
    } catch (error) {
      console.error("Error processing credits:", error);
      toast({
        title: "Credit Error",
        description: "Your search was successful, but we couldn't process your credits",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessingCredits(false);
    }
  }, [user, userProfile, creditCost, companyName, refreshUserProfile, toast]);

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

    const currentWebhookUrl = webhookUrl || DEFAULT_WEBHOOK_URL;

    if (!user || !userProfile) {
      console.error("User or user profile is missing", { user, userProfile });
      setErrorMessage("Authentication error. Please try logging out and back in.");
      setSearchState(SearchState.ERROR);
      return;
    }
    
    setSearchingStatus(true);
    setSearchState(SearchState.SEARCHING);
    setErrorMessage(null);
    
    toast({
      title: "Search Started",
      description: "Searching for company data...",
    });
    
    const performSearch = async () => {
      try {
        console.log("Making webhook call to:", currentWebhookUrl);
        console.log("Searching for company:", companyName);
        
        const requestBody: WebhookRequestBody = {
          company: companyName,
          questions: questions.map(q => ({
            id: q.id,
            text: q.question
          }))
        };
        
        if (userProfile) {
          requestBody.userInfo = {
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || ''
          };
        }
        
        console.log("Request body with user profile:", requestBody);
        
        console.log("Starting webhook call - button should remain in searching state");
        const directResponse = await callCompanyWebhook(
          currentWebhookUrl, 
          companyName, 
          questions,
          requestBody
        );
        
        if (!isSearchingRef.current) {
          console.log("Search was cancelled or another search started");
          return;
        }
        
        if (!directResponse.ok) {
          throw new Error(`HTTP error! status: ${directResponse.status}`);
        }
        
        const responseData = await directResponse.json();
        
        if (!isSearchingRef.current) {
          console.log("Search was cancelled during response processing");
          return;
        }
        
        const parseResult = parseWebhookResponse(responseData);
        console.log("Parsed webhook response:", parseResult);
        
        const { processedResults, contactInfo } = parseResult;
        
        if (!processedResults || processedResults.length === 0) {
          console.warn("No processed results found in the webhook response");
        }
        
        await processCredits();
        
        console.log("Setting search results:", { processedResults, contactInfo });
        const newResult = {
          results: processedResults || [],
          contact_info: contactInfo
        };
        setResult(newResult);
        console.log("Search results set:", newResult);
        
        if (user.id) {
          console.log("Storing search results");
          await storeSearchResults(
            user.id, 
            companyName, 
            responseData, 
            processedResults || [], 
            contactInfo
          );
          
          onSearch();
        }
        
        console.log("Search process completed");
        setSearchState(SearchState.COMPLETED);
        
        toast({
          title: "Search Complete",
          description: "Your search results are ready",
        });
      } catch (error: any) {
        console.error("Error during company search:", error);
        
        if (isSearchingRef.current) {
          setSearchState(SearchState.ERROR);
          
          if (error.message?.includes('HTTP error')) {
            setErrorMessage("The search service is currently unavailable. Please try again later.");
          } else if (error.message?.includes('timeout')) {
            setErrorMessage("The search request timed out. The company might be too complex to analyze.");
          } else if (error.message?.includes('Network')) {
            setErrorMessage("Network error. Please check your internet connection and try again.");
          } else {
            setErrorMessage("Unable to process your search at this time. Please try again later.");
          }
          
          toast({
            title: "Error",
            description: errorMessage || "Unable to process your search at this time. Please try again later.",
            variant: "destructive",
          });
        }
      } finally {
        if (isSearchingRef.current) {
          console.log("Resetting search status");
          setTimeout(() => {
            setSearchingStatus(false);
          }, 1000);
        }
      }
    };
    
    performSearch();
  }, [companyName, webhookUrl, user, userProfile, questions, toast, refreshUserProfile, onSearch, errorMessage, setSearchingStatus, processCredits]);

  return {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    searchState,
    isLoadingWebhook,
    result,
    errorMessage,
    handleSearch,
    creditCost,
    isSearching,
    isProcessingCredits
  };
};
