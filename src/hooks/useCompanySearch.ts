
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
      // =====================================================================
      // Try direct webhook call first as a fallback
      // =====================================================================
      console.log("First trying direct webhook approach as a fallback...");
      
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
      
      if (directResponse.ok) {
        console.log("Direct webhook call successful!");
        
        const responseData = await directResponse.json();
        console.log("Direct webhook raw response:", responseData);
        
        // Process the response
        let processedData = null;
        let contactInfo = null;
        
        // Handle the new format: [{ output: [{ results: [...], contact_info: {...} }] }]
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
          const output = responseData[0].output;
          
          if (Array.isArray(output) && output.length > 0) {
            const firstOutput = output[0];
            
            if (firstOutput.results) {
              processedData = firstOutput.results;
            }
            
            if (firstOutput.contact_info) {
              contactInfo = firstOutput.contact_info;
            }
          }
        }
        
        // Set the result
        setResult({
          results: processedData || [],
          contact_info: contactInfo || undefined
        });
        
        toast({
          title: "Success",
          description: "Questions answered successfully (direct method)",
        });
        
        onSearch();
        setIsLoading(false);
        return;
      } else {
        console.log("Direct webhook call failed, falling back to edge function...");
      }
      
      // =====================================================================
      // Fall back to edge function
      // =====================================================================
      const functionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-n8n-workflow';
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      // Use the simpler format for questions
      const questionsToSend = questions.map(q => ({
        id: q.id,
        question: q.question
      }));

      console.log("Sending request to edge function with payload:", {
        company: companyName,
        questions: questionsToSend,
        webhookUrl,
        userId: user?.id
      });

      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          company: companyName,
          questions: questionsToSend,
          webhookUrl,
          userId: user?.id
        }),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Edge function response:", responseData);
      
      if (responseData.success) {
        setResult({
          results: responseData.data,
          contact_info: responseData.contact_info
        });
        
        toast({
          title: "Success",
          description: "Questions answered successfully",
        });
        onSearch(); // Trigger refetch of searches
      } else {
        toast({
          title: "Warning",
          description: responseData.message || "Got a response, but it may not contain answers",
        });
      }
    } catch (error: any) {
      console.error("Error calling edge function:", error);
      
      let errorMessage = "Failed to call webhook";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. The server took too long to respond.";
      } else if (error.message === 'Failed to fetch') {
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
