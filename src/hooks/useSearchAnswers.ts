
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  question: string;
};

export type CompanyAnswer = {
  id: string;
  company_search_id: string;
  question_id: string;
  answer: string | null;
  question?: string;
};

export const useSearchAnswers = (questions: Question[]) => {
  const [searchAnswers, setSearchAnswers] = useState<{[key: string]: CompanyAnswer[]}>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();

  const fetchAnswersForSearch = async (searchId: string) => {
    setIsLoadingAnswers(prev => ({ ...prev, [searchId]: true }));
    
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select('*')
        .eq('company_search_id', searchId);
        
      if (answersError) throw answersError;
      
      const answersWithQuestions = (answersData || []).map(answer => {
        const question = questions.find(q => q.id === answer.question_id);
        return {
          ...answer,
          question: question ? question.question : 'Unknown question'
        };
      });
      
      setSearchAnswers(prev => ({
        ...prev,
        [searchId]: answersWithQuestions
      }));
      
    } catch (error: any) {
      console.error('Error fetching answers:', error);
      toast({
        title: "Error",
        description: "Failed to load answers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnswers(prev => ({ ...prev, [searchId]: false }));
    }
  };

  return {
    searchAnswers,
    isLoadingAnswers,
    fetchAnswersForSearch
  };
};
