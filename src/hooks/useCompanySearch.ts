import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import { storeSearchResults } from '@/services/companySearchService';
import { callCompanyWebhook, getCompanyWebhookUrl } from '@/services/companyWebhookService';
import { Question, SearchResultType } from '@/types/company';

// Simplified search process states
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
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingCredits, setIsProcessingCredits] = useState(false);
  
  // Use a ref to track if a search is in progress - this won't trigger re-renders
  const isSearchingRef = useRef(false);
  // Use a state for components that need to re-render when search status changes
  const [isSearching, setIsSearching] = useState(false);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  // For backward compatibility
  const isLoading = isSearching;
  const isDeductingCredit = isProcessingCredits;

  // Credit cost calculation memoized to prevent unnecessary recalculations
  const creditCost = useMemo(() => calculateCreditCost(questions.length), [questions.length]);

  // Load webhook URL only once when component mounts
  useEffect(() => {
    const loadWebhookUrl = async () => {
      setIsLoadingWebhook(true);
      try {
        // Use the new function to get the company research webhook URL
        const url = await getCompanyWebhookUrl();
        setWebhookUrl(url);
        console.log("Loaded company research webhook URL:", url);
      } catch (error) {
        console.error('Error loading company research webhook URL:', error);
        setWebhookUrl('');
      } finally {
        setIsLoadingWebhook(false);
      }
    };
    loadWebhookUrl();
  }, []);

  // Reset error message when company name changes
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [companyName, errorMessage]);

  // Reset to idle state when questions change
  useEffect(() => {
    if (searchState === SearchState.ERROR || searchState === SearchState.COMPLETED) {
      setSearchState(SearchState.IDLE);
    }
  }, [questions, searchState]);

  // Function to safely set the searching state in both ref and state
  const setSearchingStatus = useCallback((status: boolean) => {
    isSearchingRef.current = status;
    setIsSearching(status);
  }, []);

  // Process credits completely independently from search
  const processCredits = useCallback(async () => {
    if (!user || !userProfile) {
      console.error("User or user profile is missing", { user, userProfile });
      return false;
    }

    setIsProcessingCredits(true);
    try {
      console.log("Processing credits after successful search");
      
      // Deduct credits
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
      // ONLY reset the credit processing flag, nothing else
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

    // Check if webhook URL is available
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Company research webhook URL is not configured",
        variant: "destructive",
      });
      return;
    }

    if (!user || !userProfile) {
      console.error("User or user profile is missing", { user, userProfile });
      setErrorMessage("Authentication error. Please try logging out and back in.");
      setSearchState(SearchState.ERROR);
      return;
    }
    
    // Set both ref and state to indicate searching is in progress
    setSearchingStatus(true);
    setSearchState(SearchState.SEARCHING);
    setErrorMessage(null);
    
    // Don't reset result until we have new results
    // This ensures the previous results stay visible until new ones are ready
    
    // Show a toast to indicate search has started
    toast({
      title: "Search Started",
      description: "Searching for company data...",
    });
    
    // Use a separate async function for the search process
    // This allows us to handle the finally block properly
    const performSearch = async () => {
      try {
        console.log("Making webhook call to:", webhookUrl);
        console.log("Searching for company:", companyName);
        
        // Make the webhook call - this is where we need to ensure the button stays in searching state
        console.log("Starting webhook call - button should remain in searching state");
        const directResponse = await callCompanyWebhook(webhookUrl, companyName, questions);
        
        // Check if the search was cancelled or another search started
        if (!isSearchingRef.current) {
          console.log("Search was cancelled or another search started");
          return;
        }
        
        if (!directResponse.ok) {
          throw new Error(`HTTP error! status: ${directResponse.status}`);
        }
        
        // Process the response
        console.log("Webhook response received, processing data");
        const responseData = await directResponse.json();
        
        // Check again if the search is still active
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
        
        // Process credits before setting results to avoid timing issues
        // This ensures the credit toast doesn't interfere with displaying results
        await processCredits();
        
        // Set the result - this is critical for displaying the search results
        console.log("Setting search results:", { processedResults, contactInfo });
        const newResult = {
          results: processedResults || [],
          contact_info: contactInfo
        };
        setResult(newResult);
        console.log("Search results set:", newResult);
        
        // Store the results
        if (user.id) {
          console.log("Storing search results");
          await storeSearchResults(
            user.id, 
            companyName, 
            responseData, 
            processedResults || [], 
            contactInfo
          );
          
          onSearch(); // Trigger refetch of searches
        }
        
        // Only now change the state to completed
        console.log("Search process completed");
        setSearchState(SearchState.COMPLETED);
        
        toast({
          title: "Search Complete",
          description: "Your search results are ready",
        });
      } catch (error: any) {
        console.error("Error during company search:", error);
        
        // Only set error state if this search is still active
        if (isSearchingRef.current) {
          setSearchState(SearchState.ERROR);
          
          // Provide more specific error messages based on the error type
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
        // Important: Only reset the searching status if this search is still the active one
        // This prevents a race condition where a new search starts before the old one finishes
        if (isSearchingRef.current) {
          console.log("Resetting search status");
          // Add a small delay to ensure UI updates properly and results are displayed
          setTimeout(() => {
            // Only reset the searching flag, keep the search state as COMPLETED
            setSearchingStatus(false);
          }, 1000);
        }
      }
    };
    
    // Start the search process
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
    isSearching, // Export the state for components that need it
    isProcessingCredits // Export credit processing state
  };
};
