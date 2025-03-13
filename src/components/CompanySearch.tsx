import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, Search as SearchIcon, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CompanySearch = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [agentQuestions, setAgentQuestions] = useState<any[]>([]);
  const [requestBody, setRequestBody] = useState<any>(null);
  const { user } = useAuth();
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
      const body: any = {
        company: companyName
      };
      
      if (agentQuestions.length > 0) {
        body.questions = agentQuestions.map(q => ({
          id: q.id,
          text: q.question
        }));
      }
      
      setRequestBody(body);
    } else {
      setRequestBody(null);
    }
  }, [companyName, agentQuestions]);

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
      const { callCompanyWebhook } = await import('@/services/companyWebhookService');
      
      console.log(`Making webhook call to ${webhookUrl} for company ${companyName}`);
      const response = await callCompanyWebhook(
        webhookUrl,
        companyName,
        requestBody.questions
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
        setResult(data.data);
        
        // We don't need to save to the database here anymore
        // since the edge function handles it
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
      <Card>
        <CardHeader>
          <CardTitle>Company Information Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter your webhook URL"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Example: https://agent.froste.eu/webhook/lovable
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Will be sent in the request body as "company"
              </p>
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Searching for information...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI agent is working on your request:
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li className="flex items-center">
                    <SearchIcon className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span>Searching company databases</span>
                  </li>
                  <li className="flex items-center">
                    <Globe className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span>Crawling relevant websites</span>
                  </li>
                  <li className="flex items-center">
                    <Database className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span>Accessing multiple knowledge bases</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  This may take a few moments. Thank you for your patience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {agentQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              These questions will be answered when you search for a company.
            </div>
            <ul className="space-y-2 list-disc pl-5">
              {agentQuestions.map(question => (
                <li key={question.id}>{question.question}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px]">
              {renderResults()}
            </div>
          </CardContent>
        </Card>
      )}
      
      {(webhookUrl && companyName) && (
        <Card>
          <CardHeader>
            <CardTitle>Developer Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Request Body</Label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
                  <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                    {requestBody ? JSON.stringify(requestBody, null, 2) : 'No request body yet'}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the complete request body being sent, including company name and all questions.
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Total Questions</Label>
                <div className="mt-1">
                  <span className="text-sm">{agentQuestions.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanySearch;
