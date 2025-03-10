import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from '@/hooks/useCompanySearch';

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
  const [contactInfo, setContactInfo] = useState<{[key: string]: ContactInfo | undefined}>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();

  const fetchAnswersForSearch = async (searchId: string) => {
    setIsLoadingAnswers(prev => ({ ...prev, [searchId]: true }));
    
    try {
      // First, fetch the company search record to get contact info
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('contact_info, website, contact_person, email, phone')
        .eq('id', searchId)
        .single();
        
      if (searchError) throw searchError;
      
      // Extract contact info from the search
      let contactInfoData: ContactInfo | undefined = undefined;
      
      if (searchData) {
        // Try to get from JSON column first
        if (searchData.contact_info) {
          contactInfoData = searchData.contact_info as ContactInfo;
        } 
        // Otherwise try to get from individual columns
        else if (searchData.website || searchData.contact_person || searchData.email || searchData.phone) {
          contactInfoData = {
            www: searchData.website,
            contact: searchData.contact_person,
            email: searchData.email,
            phone: searchData.phone
          };
        }
        
        if (contactInfoData) {
          setContactInfo(prev => ({
            ...prev,
            [searchId]: contactInfoData
          }));
        }
      }
      
      // Then fetch the answers
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
    contactInfo,
    isLoadingAnswers,
    fetchAnswersForSearch
  };
};
