
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  question: string;
};

type Answer = {
  question_id: string;
  answer: string;
};

type SearchResults = {
  results?: Answer[];
};

const Dashboard = () => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResults | null>(null);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // If not loading and no user, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(10);
        
      if (error) throw error;
      
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
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
      
      if (responseData.success && responseData.data) {
        setResult(responseData.data);
        toast({
          title: "Success",
          description: "Questions answered successfully",
        });
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

  const renderResults = () => {
    if (!result) return null;
    
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-4">
          {result.results.map((item: Answer, index: number) => {
            const questionObj = questions.find(q => q.id === item.question_id);
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Company Intelligence Dashboard</h1>
          
          <div className="mb-10 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ask Questions About a Company</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-6">
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
                      placeholder="Enter company name to research"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading || questions.length === 0}>
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
            
            {questions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Questions We'll Ask ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    {questions.map(question => (
                      <li key={question.id} className="text-sm">
                        {question.question}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No questions available. Please add questions in the Agent Questions section first.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Results for {companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[500px]">
                  {renderResults()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
