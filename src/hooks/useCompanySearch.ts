
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';
import { fetchWebhookSettings } from '@/services/webhookService';

type Question = {
  id: string;
  question: string;
};

type Answer = {
  question_id: string;
  answer: string;
};

type ContactInfo = {
  www?: string;
  contact?: string;
  email?: string;
  phone?: string;
};

type SearchResultType = {
  results?: Answer[];
  contact_info?: ContactInfo;
};

// Define a type for the search record
type CompanySearchRecord = {
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: ContactInfo;
  website?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
};

export const useCompanySearch = (questions: Question[], onSearch: () => void) => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [isDeductingCredit, setIsDeductingCredit] = useState(false);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadWebhookUrl = async () => {
      const settings = await fetchWebhookSettings();
      if (settings) {
        setWebhookUrl(settings.url);
      }
    };
    loadWebhookUrl();
  }, []);

  // Helper function to store search results in database
  const storeSearchResults = async (company: string, responseData: any, processedResults: Answer[], contactInfo?: ContactInfo) => {
    if (!user || !user.id) return;
    
    try {
      // Store the company search
      const searchRecord: CompanySearchRecord = {
        user_id: user.id,
        company_name: company,
        result: responseData,
        created_at: new Date().toISOString()
      };
      
      // Add contact info if available
      if (contactInfo) {
        searchRecord.contact_info = contactInfo;
        searchRecord.website = contactInfo.www || null;
        searchRecord.contact_person = contactInfo.contact || null;
        searchRecord.email = contactInfo.email || null;
        searchRecord.phone = contactInfo.phone || null;
      }
      
      const { data: insertedRecord, error: searchError } = await supabase
        .from('company_searches')
        .insert(searchRecord)
        .select('id')
        .single();
      
      if (searchError) {
        console.error('Error storing company search:', searchError);
        throw searchError;
      }
      
      console.log('Company search stored with ID:', insertedRecord.id);
      
      // Store individual answers if available
      if (processedResults && Array.isArray(processedResults)) {
        const answersToInsert = processedResults
          .filter(result => result.question_id && result.answer) // Only valid results
          .map(result => ({
            company_search_id: insertedRecord.id,
            question_id: result.question_id,
            answer: result.answer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
        
        if (answersToInsert.length > 0) {
          console.log('Inserting answers:', JSON.stringify(answersToInsert));
          
          const { error: answersError } = await supabase
            .from('company_question_answers')
            .insert(answersToInsert);
          
          if (answersError) {
            console.error('Error storing answers:', answersError);
            // Continue even if answer storage fails
          } else {
            console.log('Successfully stored answers for all questions');
          }
        } else {
          console.log('No valid answers found to store');
        }
      }
      
      return true;
    } catch (dbError) {
      console.error('Database error storing search results:', dbError);
      return false;
    }
  };

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
      toast({
        title: "Error",
        description: "No webhook URL configured. Please contact an administrator.",
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
      console.log("Making direct webhook call to:", webhookUrl);
      
      const directResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          company: companyName, 
          questions: questions.map(q => ({
            id: q.id,
            question: q.question
          }))
        })
      });
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const responseData = await directResponse.json();
      console.log("Webhook raw response:", responseData);
      
      // Process the response
      let processedResults = null;
      let contactInfo = null;
      
      // Handle the format: [{ output: [{ results: [...], contact_info: {...} }] }]
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        const output = responseData[0].output;
        
        if (Array.isArray(output) && output.length > 0) {
          const firstOutput = output[0];
          
          if (firstOutput.results) {
            processedResults = firstOutput.results;
          }
          
          if (firstOutput.contact_info) {
            contactInfo = firstOutput.contact_info;
          }
        }
      }
      
      // Set the result for UI display
      setResult({
        results: processedResults || [],
        contact_info: contactInfo || undefined
      });
      
      // Store search results in database
      if (processedResults) {
        const storageSuccess = await storeSearchResults(companyName, responseData, processedResults, contactInfo);
        
        if (storageSuccess) {
          console.log("Successfully stored search results to database");
          onSearch(); // Trigger refetch of searches
        } else {
          console.warn("Failed to store search results to database");
          toast({
            title: "Warning",
            description: "Search results were retrieved but could not be saved to history.",
          });
        }
      } else {
        console.warn("No processed results found in webhook response");
        toast({
          title: "Warning",
          description: "Received response from webhook, but no valid answers could be extracted.",
        });
      }
      
      toast({
        title: "Success",
        description: "Questions answered successfully",
      });
      
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      
      let errorMessage = "Failed to call webhook";
      
      if (error.message === 'Failed to fetch') {
        errorMessage = "Network error. Please check your internet connection or the webhook URL.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    companyName,
    setCompanyName,
    webhookUrl,
    updateWebhookUrl: setWebhookUrl,
    isLoading,
    isDeductingCredit,
    result,
    handleSearch,
    questions
  };
};

export type { SearchResultType, ContactInfo };
