
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
      
      // Fetch company search data with explicit columns selection
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select(`
          id, 
          company_name, 
          created_at, 
          user_id, 
          result, 
          contact_info,
          www, 
          contact, 
          email, 
          phone,
          role,
          score,
          advice,
          introduction,
          subject,
          sent_email_at,
          updated_at
        `)
        .eq('id', searchId)
        .single();
      
      if (searchError) {
        console.error('Error fetching company search data:', searchError.message, searchError.details);
        throw searchError;
      }
      
      if (!searchData) {
        console.error('Company search not found for ID:', searchId);
        throw new Error('Company search not found');
      }
      
      console.log('Retrieved company search data from Supabase:', searchData);
      console.log('Email sent timestamp:', searchData.sent_email_at);
      setCompanySearch(searchData);
      
      // Set initial values for value proposition fields
      // Always use the database values, ensuring all fields are initialized with values from database
      const newInitialValues = {
        score: searchData.score || null,
        advice: searchData.advice || '',
        introduction: searchData.introduction || '',
        subject: searchData.subject || ''
      };
      
      setInitialValues(newInitialValues);
      
      console.log('Set initial values from Supabase:', {
        score: newInitialValues.score,
        advice: newInitialValues.advice ? `${newInitialValues.advice.substring(0, 20)}...` : null,
        introduction: newInitialValues.introduction ? `${newInitialValues.introduction.substring(0, 20)}...` : null,
        subject: newInitialValues.subject,
        emailSent: searchData.sent_email_at
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
    console.log('Explicitly refetching company data for ID:', searchId);
    try {
      await fetchCompanyData();
      console.log('Data refresh completed successfully');
      
      // Verify the data was actually refreshed
      const { data, error } = await supabase
        .from('company_searches')
        .select('sent_email_at')
        .eq('id', searchId)
        .single();
        
      if (error) {
        console.error('Error in verification fetch:', error);
      } else {
        console.log('Verification fetch - sent_email_at:', data.sent_email_at);
      }
    } catch (error) {
      console.error('Error refreshing company data:', error);
    }
  }, [fetchCompanyData, searchId]);

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
