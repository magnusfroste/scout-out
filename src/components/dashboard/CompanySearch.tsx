
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Import refactored components
import WebhookForm from './WebhookForm';
import CompanyInput from './CompanyInput';
import SearchButton from './SearchButton';
import QuestionsList from './QuestionsList';
import SearchResults from './SearchResults';

// Import credit utilities
import { deductCredits, calculateCreditCost } from '@/utils/creditUtils';

type Question = {
  id: string;
  question: string;
};

type Answer = {
  question_id: string;
  answer: string;
};

type SearchResultType = {
  results?: Answer[];
};

interface CompanySearchProps {
  questions: Question[];
  onSearch: () => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch }) => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResultType | null>(null);
  const [isDeductingCredit, setIsDeductingCredit] = useState(false);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

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

    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
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
      
      if (responseData.success) {
        setResult(responseData.data);
        toast({
          title: "Success",
          description: "Questions answered successfully",
        });
        onSearch(); // Trigger refetch of searches
      } else {
        setResult(responseData);
        toast({
          title: "Warning",
          description: "Got a response, but it may not contain answers",
        });
      }
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to call webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate credit cost
  const questionsCount = questions.length;
  const creditCost = calculateCreditCost(questionsCount);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask Questions About a Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <WebhookForm 
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              isDisabled={isLoading}
            />
            
            <CompanyInput 
              companyName={companyName}
              setCompanyName={setCompanyName}
              isDisabled={isLoading}
            />
            
            <SearchButton 
              isLoading={isLoading}
              isProcessing={isDeductingCredit}
              disabled={isLoading || questions.length === 0 || isDeductingCredit || (userProfile && userProfile.credits < creditCost)}
              creditCost={creditCost}
              questionsCount={questionsCount}
            />
          </form>
        </CardContent>
      </Card>
      
      <QuestionsList questions={questions} />
      
      {result && (
        <SearchResults 
          result={result} 
          companyName={companyName} 
          questions={questions} 
        />
      )}
    </div>
  );
};

export default CompanySearch;
