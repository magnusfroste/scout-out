/**
 * Hook for fetching company detail data
 * Uses the data layer for database operations
 */

import { useState, useEffect, useCallback } from 'react';
import { companyRepository } from '@/data/companyRepository';
import { CompanySearchRecord, CompanyQuestionAnswer } from '@/models/company';

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
    score: null as number | null,
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
      
      // Use repository to fetch company search
      const searchData = await companyRepository.findById(searchId);
      
      if (!searchData) {
        console.error('Company search not found for ID:', searchId);
        throw new Error('Company search not found');
      }
      
      console.log('Retrieved company search data:', searchData);
      console.log('Email sent timestamp:', searchData.sent_email_at);
      setCompanySearch(searchData);
      
      // Set initial values for value proposition fields
      const newInitialValues = {
        score: searchData.score || null,
        advice: searchData.advice || '',
        introduction: searchData.introduction || '',
        subject: searchData.subject || ''
      };
      
      setInitialValues(newInitialValues);
      
      console.log('Set initial values from database:', {
        score: newInitialValues.score,
        advice: newInitialValues.advice ? `${newInitialValues.advice.substring(0, 20)}...` : null,
        introduction: newInitialValues.introduction ? `${newInitialValues.introduction.substring(0, 20)}...` : null,
        subject: newInitialValues.subject,
        emailSent: searchData.sent_email_at
      });
      
      // Use repository to fetch question answers
      const answersData = await companyRepository.findAnswersBySearchId(searchId);
      setQuestionAnswers(answersData);
      
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
    await fetchCompanyData();
    console.log('Data refresh completed successfully');
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
