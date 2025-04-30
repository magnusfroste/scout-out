
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearchRecord, CompanyQuestionAnswer } from '@/types/company';

interface UseFetchCompanyDataReturn {
  companySearch: CompanySearchRecord | null;
  questionAnswers: CompanyQuestionAnswer[];
  isLoading: boolean;
  initialValues: {
    score: number | null;
    advice: string;
    introduction: string;
    subject: string;
  };
}

export const useFetchCompanyData = (searchId: string): UseFetchCompanyDataReturn => {
  const [companySearch, setCompanySearch] = useState<CompanySearchRecord | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<CompanyQuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({
    score: null as number | null,
    advice: '',
    introduction: '',
    subject: ''
  });
  const { toast } = useToast();

  const fetchCompanySearch = useCallback(async () => {
    if (!searchId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();
      
      if (error) throw error;
      
      setCompanySearch(data);
      
      // Now fetch question answers for this search with agent_questions included
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select(`
          id,
          answer,
          question_id,
          company_search_id,
          created_at,
          agent_questions:question_id(id, question)
        `)
        .eq('company_search_id', searchId);
        
      if (answersError) throw answersError;
      
      // Transform the data to match our CompanyQuestionAnswer interface
      const transformedAnswers: CompanyQuestionAnswer[] = answersData.map((item: any) => ({
        id: item.id,
        answer: item.answer,
        question_id: item.question_id,
        company_search_id: item.company_search_id,
        created_at: item.created_at,
        agent_questions: item.agent_questions
      }));
      
      setQuestionAnswers(transformedAnswers);
      
      // Set initial values for checking unsaved changes
      if (data) {
        setInitialValues({
          score: data.score,
          advice: data.advice || '',
          introduction: data.introduction || '',
          subject: data.subject || ''
        });
      }
      
    } catch (error: any) {
      console.error('Error fetching company search:', error);
      toast({
        title: 'Error',
        description: `Failed to load company details: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchId, toast]);

  // Initial fetch
  useEffect(() => {
    fetchCompanySearch();
  }, [fetchCompanySearch]);

  return {
    companySearch,
    questionAnswers,
    isLoading,
    initialValues
  };
};
