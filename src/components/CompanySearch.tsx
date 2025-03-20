
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebhookRequestBody } from '@/services/companyWebhookService';

import SearchForm from './company-search/SearchForm';
import LoadingIndicator from './company-search/LoadingIndicator';
import QuestionsList from './company-search/QuestionsList';
import ResultsDisplay from './company-search/ResultsDisplay';
import DeveloperLog from './company-search/DeveloperLog';

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [agentQuestions, setAgentQuestions] = useState<any[]>([]);
  const [requestBody, setRequestBody] = useState<any>(null);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  useEffect(() => {
    fetchAgentQuestions();
  }, [user]);

  useEffect(() => {
    if (companyName) {
      const body: WebhookRequestBody = {
        company: companyName,
        questions: agentQuestions.map(q => ({
          id: q.id,
          text: q.question
        }))
      };
      
      if (userProfile) {
        body.userInfo = {
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || ''
        };
      }
      
      setRequestBody(body);
    } else {
      setRequestBody(null);
    }
  }, [companyName, agentQuestions, userProfile]);

  const fetchAgentQuestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setAgentQuestions(data || []);
    } catch (error: any) {
      console.error('Error fetching agent questions:', error);
      toast({
        title: "Error",
        description: "Failed to load agent questions",
        variant: "destructive",
      });
    }
  };

  const saveSearchResults = async (searchId: string, results: any[]) => {
    if (!user || !results || !results.length) return;
    
    try {
      console.log('Saving answers for search ID:', searchId);
      
      const answersToSave = results.map((item: any) => {
        return {
          company_search_id: searchId,
          question_id: item.question_id,
          answer: item.answer || JSON.stringify(item)
        };
      });
      
      if (answersToSave.length > 0) {
        const { error: answersError } = await supabase
          .from('company_question_answers')
          .insert(answersToSave);
          
        if (answersError) throw answersError;
        
        console.log('Answers saved for all questions');
      }
    } catch (error: any) {
      console.error('Error saving answers to database:', error);
      toast({
        title: "Error",
        description: "Failed to save answers",
        variant: "destructive",
      });
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

    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      toast({
        title: "Research Started",
        description: "Researching company information...",
      });
      
      const { callCompanyWebhook } = await import('@/services/companyWebhookService');
      
      console.log(`Making webhook call to ${webhookUrl} for company ${companyName}`);
      
      // Create a simple webhook request body with userInfo at the top level
      const body: WebhookRequestBody = {
        company: companyName,
        questions: agentQuestions.map(q => ({
          id: q.id,
          text: q.question
        }))
      };
      
      // Add user profile information if available
      if (userProfile) {
        body.userInfo = {
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || ''
        };
      }
      
      // Call the webhook with the properly structured body
      const response = await callCompanyWebhook(
        webhookUrl,
        companyName,
        agentQuestions,
        body
      );
      
      console.log("Webhook response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("Webhook response data:", data);
      
      if (data.success && data.data) {
        toast({
          title: "Research Complete",
          description: "Results retrieved successfully!",
        });
        setResult(data.data);
      } else {
        setResult(data);
      }
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      setResult({ error: error.message || "Failed to call webhook" });
      
      toast({
        title: "Error",
        description: error.message || "Failed to call webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!result) return null;
    
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-4">
          {result.results.map((item: any, index: number) => {
            const questionObj = agentQuestions.find(q => q.id === item.question_id);
            const questionText = questionObj ? questionObj.question : `Question ${index + 1}`;
            
            return (
              <div key={item.question_id || index} className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="font-medium text-lg mb-2">{questionText}</h3>
                <p className="text-sm whitespace-pre-wrap">{item.answer || "No answer provided"}</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        companyName={companyName}
        setCompanyName={setCompanyName}
        isLoading={isLoading}
        handleSearch={handleSearch}
      />

      {isLoading && <LoadingIndicator />}

      <QuestionsList questions={agentQuestions} />

      {result && (
        <ResultsDisplay 
          result={result} 
          agentQuestions={agentQuestions}
          renderResults={renderResults}
        />
      )}
      
      {(webhookUrl && companyName) && (
        <DeveloperLog 
          webhookUrl={webhookUrl}
          companyName={companyName}
          requestBody={requestBody}
          agentQuestions={agentQuestions}
        />
      )}
    </div>
  );
};

export default CompanySearch;
