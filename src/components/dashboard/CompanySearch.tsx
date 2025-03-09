import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface CompanySearchProps {
  questions: Question[];
  onSearch: () => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch }) => {
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResults | null>(null);
  const [isDeductingCredit, setIsDeductingCredit] = useState(false);
  
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

  const logCreditTransaction = async (amount: number, description: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert([{
          user_id: user.id,
          amount: amount,
          description: description
        }]);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging credit transaction:', error);
    }
  };

  const deductCredits = async (amount: number, reason: string) => {
    if (!user || !userProfile) return false;
    
    setIsDeductingCredit(true);
    
    try {
      if (userProfile.credits < amount) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${amount} credits for this action. You currently have ${userProfile.credits} credits.`,
          variant: "destructive",
        });
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ credits: userProfile.credits - amount })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await logCreditTransaction(-amount, reason);
      
      await refreshUserProfile();
      
      return true;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to deduct credits. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeductingCredit(false);
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

    const questionsCount = questions.length;
    const CREDIT_COST = Math.max(1, Math.ceil(questionsCount / 10));
    
    const creditSuccess = await deductCredits(CREDIT_COST, `Company search: ${companyName}`);
    
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
    <div className="space-y-6">
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
            
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                disabled={isLoading || questions.length === 0 || isDeductingCredit || (userProfile && userProfile.credits < CREDIT_COST)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : isDeductingCredit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <span>Cost: <span className="font-medium text-foreground">{CREDIT_COST} {CREDIT_COST === 1 ? 'credit' : 'credits'}</span></span>
                <p className="text-xs text-muted-foreground mt-1">({questionsCount} questions, 10 questions per credit)</p>
              </div>
            </div>
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
              No questions available. Please add questions in the Manage Questions tab first.
            </p>
          </CardContent>
        </Card>
      )}
      
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
  );
};

export default CompanySearch;
