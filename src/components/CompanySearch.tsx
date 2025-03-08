
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
  const [fullWebhookUrl, setFullWebhookUrl] = useState<string>('');
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

  // Update the full webhook URL whenever dependencies change
  useEffect(() => {
    if (webhookUrl && companyName) {
      // Format the URL with query parameter
      const queryParam = `company=${encodeURIComponent(companyName)}`;
      const baseUrl = webhookUrl.includes('?') 
        ? `${webhookUrl}&${queryParam}`
        : `${webhookUrl}?${queryParam}`;
      
      // Add agent questions as URL parameters if available
      let fullUrl = baseUrl;
      if (agentQuestions.length > 0) {
        agentQuestions.forEach((question, index) => {
          const questionParam = `question${index + 1}=${encodeURIComponent(question.question)}`;
          fullUrl = fullUrl.includes('?') 
            ? `${fullUrl}&${questionParam}`
            : `${fullUrl}?${questionParam}`;
        });
      }
      
      setFullWebhookUrl(fullUrl);
    } else {
      setFullWebhookUrl('');
    }
  }, [webhookUrl, companyName, agentQuestions]);

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
      
      // If we have agent questions and results to save
      if (agentQuestions.length > 0 && result) {
        // Extract answers for each question if available
        const answersToSave = agentQuestions.map(question => {
          // Try to find answer in result - the exact structure depends on your webhook response
          // Assuming result might contain answers in a format like {questionId: 'answer'}
          // or maybe in an array format. Adjust this logic based on your actual data structure
          let answer = null;
          
          // This is a simplistic approach - you'll need to adjust according to your response structure
          if (result.answers && result.answers[question.id]) {
            answer = result.answers[question.id];
          } else if (typeof result === 'object' && result !== null) {
            // Try to find an answer by looking for question text in the keys or looking for question id
            // This is just a fallback, ideally your webhook response would have a more predictable structure
            const questionKey = Object.keys(result).find(key => 
              key === question.id || 
              key === question.question || 
              (typeof result[key] === 'object' && result[key]?.question === question.question)
            );
            
            if (questionKey) {
              answer = typeof result[questionKey] === 'object' 
                ? result[questionKey].answer || result[questionKey].response 
                : result[questionKey];
            }
          }
          
          // If no specific answer found, store the entire result for now
          // In a real app, you'd have a more structured answer extraction
          if (answer === null && typeof result === 'string') {
            answer = result;
          } else if (answer === null) {
            answer = JSON.stringify(result);
          }
          
          return {
            company_search_id: searchData.id,
            question_id: question.id,
            answer: answer
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
      // Use the full webhook URL that includes questions
      console.log("Full URL:", fullWebhookUrl);
      
      // Direct approach for GET request
      const response = await fetch(fullWebhookUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("Webhook response status:", response.status);
      
      // Get the response text first
      const responseText = await response.text();
      
      // Try to parse as JSON, fall back to text if not JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If not valid JSON, use text as is
        responseData = { response: responseText };
      }

      console.log("Response data:", responseData);
      setResult(responseData);
      
      // Save search to database
      if (user) {
        await saveSearchToDatabase(companyName, responseData);
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
                Will be sent as "?company=yourCompanyName" parameter
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
              <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
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
                <Label className="text-sm font-medium">Complete Webhook URI</Label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
                  <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                    {fullWebhookUrl}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the complete URL being called, including company name and all agent questions as parameters.
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
