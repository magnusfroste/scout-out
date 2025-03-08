
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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

  // Save webhook URL to localStorage when it changes
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  // Fetch agent questions when component mounts
  useEffect(() => {
    fetchAgentQuestions();
  }, [user]);

  // Update the request body whenever dependencies change
  useEffect(() => {
    if (companyName) {
      const body: any = {
        company: companyName
      };
      
      // Add agent questions if available
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

  const saveSearchToDatabase = async (companyName: string, result: any) => {
    if (!user) return;
    
    try {
      // First, save the company search
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .insert({
          user_id: user.id,
          company_name: companyName,
          result: result
        })
        .select('id')
        .single();
        
      if (searchError) throw searchError;
      
      console.log('Search saved to database with ID:', searchData.id);
      
      // If we have agent questions and structured results to save
      if (agentQuestions.length > 0 && result && result.results) {
        // Extract answers for each question from structured response
        const answersToSave = result.results.map((item: any) => {
          return {
            company_search_id: searchData.id,
            question_id: item.question_id,
            answer: item.answer || JSON.stringify(item)
          };
        });
        
        // Save all the answers
        if (answersToSave.length > 0) {
          const { error: answersError } = await supabase
            .from('company_question_answers')
            .insert(answersToSave);
            
          if (answersError) throw answersError;
          
          console.log('Answers saved for all questions');
        }
      }
      
      return searchData.id;
    } catch (error: any) {
      console.error('Error saving search to database:', error);
      toast({
        title: "Error",
        description: "Failed to save search history",
        variant: "destructive",
      });
      return null;
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
      // Call the Supabase Edge Function to handle the webhook
      const functionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-n8n-workflow';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          company: companyName,
          questions: requestBody.questions,
          webhookUrl,
          userId: user?.id
        })
      });
      
      console.log("Function response status:", response.status);
      
      // Get the response text first
      const responseText = await response.text();
      
      // Try to parse as JSON, fall back to text if not JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Response data:", responseData);
        
        // If response contains data.data, use that as our result
        if (responseData.success && responseData.data) {
          setResult(responseData.data);
          
          // Save search to database (if we have a structured response)
          if (user && responseData.data) {
            await saveSearchToDatabase(companyName, responseData.data);
          }
        } else {
          setResult(responseData);
        }
      } catch (e) {
        // If not valid JSON, use text as is
        console.error("Error parsing JSON:", e);
        setResult({ response: responseText });
      }

      toast({
        title: "Success",
        description: "Webhook called successfully",
      });
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

  // Render function to display results in a structured way
  const renderResults = () => {
    if (!result) return null;
    
    // If we have a structured response with results array
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-4">
          {result.results.map((item: any, index: number) => {
            // Find the original question text
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
    
    // Fallback to showing raw JSON
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
