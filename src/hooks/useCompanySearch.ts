
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
      const functionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-n8n-workflow';
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      const questionsToSend = questions.map(q => ({
        id: q.id,
        text: q.question
      }));

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
        })
      });
      
      const responseData = await response.json();
      console.log("Raw webhook response:", responseData);
      
      if (responseData.success) {
        // Store the response data directly
        setResult({
          results: responseData.data.results,
          contact_info: responseData.contact_info || responseData.data.contact_info
        });
        
        toast({
          title: "Success",
          description: "Questions answered successfully",
        });
        onSearch(); // Trigger refetch of searches
      } else {
        // If success is false but we still got a response, store it
        setResult(responseData);
        
        toast({
          title: "Warning",
          description: "Got a response, but it may not contain answers",
        });
      }
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
