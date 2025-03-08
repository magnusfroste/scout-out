
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/components/Button';

interface CompanySearchDetailProps {
  searchId: string;
  onBack: () => void;
}

const CompanySearchDetail = ({ searchId, onBack }: CompanySearchDetailProps) => {
  const [companySearch, setCompanySearch] = useState<any>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (searchId) {
      fetchCompanyDetails();
    }
  }, [searchId]);

  const fetchCompanyDetails = async () => {
    if (!user || !searchId) return;

    setIsLoading(true);
    try {
      // Fetch the company search
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (searchError) throw searchError;
      setCompanySearch(searchData);

      // Fetch the questions and answers for this company
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select(`
          id,
          answer,
          question_id,
          created_at,
          agent_questions (
            id,
            question
          )
        `)
        .eq('company_search_id', searchId)
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;
      setQuestionAnswers(answersData || []);

    } catch (error: any) {
      console.error('Error fetching company details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companySearch) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Company search not found</p>
        <Button onClick={onBack}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{companySearch.company_name}</CardTitle>
          <CardDescription>
            Searched on {formatDate(companySearch.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-2">Company Information</h3>
          <div className="overflow-auto max-h-[300px] mb-6">
            <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
              {JSON.stringify(companySearch.result, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {questionAnswers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questionAnswers.map((qa) => (
              <div key={qa.id} className="pb-4">
                <h4 className="font-medium text-md mb-2">{qa.agent_questions.question}</h4>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">{qa.answer || 'No answer available'}</p>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No questions or answers available for this company.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanySearchDetail;
