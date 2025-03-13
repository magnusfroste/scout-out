import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from '@/types/company';
import { Json } from '@/integrations/supabase/types';

export interface CompanyAnswer {
  id: string;
  question: string;
  answer: string;
}

interface CompanySearchRecord {
  id: string;
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: any;
  www?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  [key: string]: any; 
}

export const useSearchAnswers = (questions: { id: string; question: string }[]) => {
  const [searchAnswers, setSearchAnswers] = useState<Record<string, CompanyAnswer[]>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, ContactInfo>>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<Record<string, boolean>>({});
  
  const fetchAnswersForSearch = async (searchId: string) => {
    setIsLoadingAnswers(prev => ({ ...prev, [searchId]: true }));
    try {
      const { data: searchDataRaw, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();
        
      if (searchError) {
        console.error('Error fetching search:', searchError);
        return;
      }
      
      const searchData = searchDataRaw as unknown as CompanySearchRecord;
      
      try {
        const typedContactInfo: ContactInfo = {
          www: searchData.www || undefined,
          contact: searchData.contact || undefined,
          email: searchData.email || undefined,
          phone: searchData.phone || undefined,
          role: searchData.role || undefined,
          address: undefined 
        };
        
        if (searchData.contact_info && typeof searchData.contact_info === 'object' && !Array.isArray(searchData.contact_info)) {
          const contactInfoData = searchData.contact_info as Record<string, any>;
          
          if (typeof contactInfoData.address === 'string') {
            typedContactInfo.address = contactInfoData.address;
          }
        }
        
        if (Object.values(typedContactInfo).some(value => value !== undefined)) {
          setContactInfo(prev => ({
            ...prev,
            [searchId]: typedContactInfo
          }));
        }
      } catch (error) {
        console.error('Error processing contact info:', error, searchData);
      }
      
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select('*')
        .eq('company_search_id', searchId);
      
      if (answersError) {
        console.error('Error fetching answers:', answersError);
        return;
      }
      
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
