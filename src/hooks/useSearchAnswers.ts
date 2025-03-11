
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from '@/types/company';

export interface CompanyAnswer {
  id: string;
  question: string;
  answer: string;
}

export const useSearchAnswers = (questions: { id: string; question: string }[]) => {
  const [searchAnswers, setSearchAnswers] = useState<Record<string, CompanyAnswer[]>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, ContactInfo>>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<Record<string, boolean>>({});
  
  const fetchAnswersForSearch = async (searchId: string) => {
    setIsLoadingAnswers(prev => ({ ...prev, [searchId]: true }));
    try {
      // First get the company search record to get contact info
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();
        
      if (searchError) {
        console.error('Error fetching search:', searchError);
        return;
      }
      
      // Store contact info if it exists
      if (searchData.contact_info) {
        try {
          // Ensure contact_info is an object (not an array)
          const contactInfoData = typeof searchData.contact_info === 'object' && 
                                 !Array.isArray(searchData.contact_info) ? 
                                 searchData.contact_info : {};
          
          const typedContactInfo: ContactInfo = {
            www: contactInfoData.www || undefined,
            contact: contactInfoData.contact || undefined,
            email: contactInfoData.email || undefined,
            phone: contactInfoData.phone || undefined
          };
          
          setContactInfo(prev => ({
            ...prev,
            [searchId]: typedContactInfo
          }));
        } catch (error) {
          console.error('Error processing contact info:', error, searchData.contact_info);
        }
      }
      
      // Fetch answers for this search
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select('*')
        .eq('company_search_id', searchId);
      
      if (answersError) {
        console.error('Error fetching answers:', answersError);
        return;
      }
      
      // Map answers to questions
      const mappedAnswers: CompanyAnswer[] = answersData.map(answer => {
        const question = questions.find(q => q.id === answer.question_id);
        return {
          id: answer.id,
          question: question ? question.question : 'Unknown Question',
          answer: answer.answer || 'No answer provided'
        };
      });
      
      setSearchAnswers(prev => ({
        ...prev,
        [searchId]: mappedAnswers
      }));
      
    } catch (error) {
      console.error('Error in fetchAnswersForSearch:', error);
    } finally {
      setIsLoadingAnswers(prev => ({ ...prev, [searchId]: false }));
    }
  };
  
  const clearSearchAnswers = (searchId: string) => {
    setSearchAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[searchId];
      return newAnswers;
    });
    
    setContactInfo(prev => {
      const newContactInfo = { ...prev };
      delete newContactInfo[searchId];
      return newContactInfo;
    });
  };
  
  return {
    searchAnswers,
    contactInfo,
    isLoadingAnswers,
    fetchAnswersForSearch,
    clearSearchAnswers
  };
};
