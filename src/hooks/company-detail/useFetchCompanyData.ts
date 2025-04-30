
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanySearchRecord, CompanyQuestionAnswer } from '@/types/company';

interface FetchCompanyDataReturn {
  companySearch: CompanySearchRecord | null;
  questionAnswers: CompanyQuestionAnswer[];
  isLoading: boolean;
  initialValues: {
    score: number | null;
    advice: string;
    introduction: string;
    subject: string;
  };
  setInitialValues: (values: any) => void;
  refetchCompanyData: () => Promise<void>;
}

export const useFetchCompanyData = (searchId: string): FetchCompanyDataReturn => {
  const [companySearch, setCompanySearch] = useState<CompanySearchRecord | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<CompanyQuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({
    score: null,
    advice: '',
    introduction: '',
    subject: ''
  });

  // Fetch company data function
  const fetchCompanyData = useCallback(async () => {
    if (!searchId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching company search data for ID:', searchId);
      
      // Fetch company search data
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();
      
      if (searchError) throw searchError;
      if (!searchData) throw new Error('Company search not found');
      
      setCompanySearch(searchData);
      console.log('Company search data fetched:', searchData);
      
      // Set initial values for value proposition fields
      setInitialValues({
        score: searchData.score || null,
        advice: searchData.advice || '',
        introduction: searchData.introduction || '',
        subject: searchData.subject || ''
      });
      
      // Fetch question answers
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select(`
          id,
          answer,
          question_id,
          company_search_id,
          created_at,
          updated_at,
          agent_questions (
            id, 
            question,
            rationale
          )
        `)
        .eq('company_search_id', searchId)
        .order('created_at', { ascending: true });
      
      if (answersError) throw answersError;
      
      // Make sure we're setting an array that matches the CompanyQuestionAnswer type
      if (answersData) {
        setQuestionAnswers(answersData as CompanyQuestionAnswer[]);
      } else {
        setQuestionAnswers([]);
      }
      
      console.log('Question answers fetched:', answersData?.length || 0, 'answers');
      
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      setCompanySearch(null);
      setQuestionAnswers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchId]);

  // Refetch data function that can be called by components
  const refetchCompanyData = useCallback(async () => {
    await fetchCompanyData();
  }, [fetchCompanyData]);

  // Initial fetch
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  return {
    companySearch,
    questionAnswers,
    isLoading,
    initialValues,
    setInitialValues,
    refetchCompanyData
  };
};
