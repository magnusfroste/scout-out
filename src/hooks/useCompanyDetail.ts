import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { saveValuePropositionData } from '@/services/valueProposition';

interface CompanySearch {
  id: string;
  company_name: string;
  contact?: string | null;
  contact_info?: any | null;
  created_at: string;
  email?: string | null;
  phone?: string | null;
  result?: any | null;
  role?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
  subject?: string | null;
  user_id: string;
  www?: string | null;
}

interface QuestionAnswer {
  id: string;
  answer: string | null;
  question_id: string;
  created_at: string;
  agent_questions: {
    id: string;
    question: string;
  };
}

export const useCompanyDetail = (searchId: string, onUpdate?: (id: string, data: any) => void) => {
  const [companySearch, setCompanySearch] = useState<CompanySearch | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [displayScore, setDisplayScore] = useState<string>('');
  const [displayAdvice, setDisplayAdvice] = useState<string>('');
  const [displayIntroduction, setDisplayIntroduction] = useState<string>('');
  const [displaySubject, setDisplaySubject] = useState<string>('');
  
  const [dbScore, setDbScore] = useState<string>('');
  const [dbAdvice, setDbAdvice] = useState<string>('');
  const [dbIntroduction, setDbIntroduction] = useState<string>('');
  const [dbSubject, setDbSubject] = useState<string>('');
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCompanyDetails = async () => {
    if (!user || !searchId) return;

    setIsLoading(true);
    try {
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (searchError) throw searchError;
      console.log('Fetched company search data:', searchData);
      setCompanySearch(searchData);

      setDbScore(searchData.score?.toString() || '');
      setDbAdvice(searchData.advice || '');
      setDbIntroduction(searchData.introduction || '');
      setDbSubject(searchData.subject || '');
      
      setDisplayScore(searchData.score?.toString() || '');
      setDisplayAdvice(searchData.advice || '');
      setDisplayIntroduction(searchData.introduction || '');
      setDisplaySubject(searchData.subject || '');

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

  const handleSave = async () => {
    if (!user || !searchId || !companySearch) return;

    setIsSaving(true);
    try {
      console.log('Starting save operation for search ID:', searchId);
      console.log('Value proposition data to save:', {
        score: displayScore ? parseInt(displayScore) : null,
        advice: displayAdvice,
        introduction: displayIntroduction,
        subject: displaySubject
      });

      const scoreValue = displayScore ? parseInt(displayScore) : null;
      
      const success = await saveValuePropositionData(
        searchId,
        scoreValue,
        displayAdvice,
        displayIntroduction,
        displaySubject
      );

      if (success) {
        // Update local state to reflect saved values
        setDbScore(displayScore);
        setDbAdvice(displayAdvice);
        setDbIntroduction(displayIntroduction);
        setDbSubject(displaySubject);
        
        setHasUnsavedChanges(false);

        // Update the companySearch state
        setCompanySearch({
          ...companySearch,
          score: scoreValue,
          advice: displayAdvice,
          introduction: displayIntroduction,
          subject: displaySubject
        });

        toast({
          title: 'Success',
          description: 'Value proposition updated successfully',
        });

        // Call onUpdate prop if provided to update parent component
        if (onUpdate) {
          onUpdate(searchId, {
            ...companySearch,
            score: scoreValue,
            advice: displayAdvice,
            introduction: displayIntroduction,
            subject: displaySubject
          });
        }
      } else {
        // Handle save failure
        toast({
          title: 'Error',
          description: 'Failed to update value proposition',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error updating company details:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: 'Error',
        description: `Failed to update value proposition: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMagicSuccess = (newScore: number | null, newAdvice: string | null, newIntroduction: string | null, newSubject: string | null) => {
    console.log('Magic value proposition generated:', { newScore, newAdvice, newIntroduction, newSubject });
    
    // Safely handle null values
    setDisplayScore(newScore !== null ? newScore.toString() : '');
    setDisplayAdvice(newAdvice || '');
    setDisplayIntroduction(newIntroduction || '');
    setDisplaySubject(newSubject || '');
    
    setHasUnsavedChanges(true);
  };

  const handleCopySuccess = () => {
    setCopySuccess(true);
    toast({
      title: "Copied!",
      description: "Introduction text copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (searchId) {
      fetchCompanyDetails();
    }
  }, [searchId]);

  useEffect(() => {
    const hasChanges = 
      displayScore !== dbScore || 
      displayAdvice !== dbAdvice || 
      displayIntroduction !== dbIntroduction || 
      displaySubject !== dbSubject;
    
    setHasUnsavedChanges(hasChanges);
  }, [displayScore, displayAdvice, displayIntroduction, displaySubject, dbScore, dbAdvice, dbIntroduction, dbSubject]);

  useEffect(() => {
    const introTextarea = document.getElementById('introduction') as HTMLTextAreaElement;
    if (introTextarea) {
      introTextarea.style.height = 'auto';
      introTextarea.style.height = `${introTextarea.scrollHeight}px`;
    }
  }, [displayIntroduction]);

  const generateWebhookExampleBody = () => {
    if (!companySearch || !questionAnswers.length) {
      return {
        company_id: "example-id-12345",
        company_name: "Example Company",
        search_data: {
          company_name: "Example Company",
          industry: "Technology",
          products: ["Software", "Hardware", "Services"],
          website: "https://example.com",
          employees: "100-500",
          headquarters: "New York, USA",
        },
        questions: [
          {
            id: "q1",
            question: "What are your company's main products?",
            answer: "Our company specializes in developing enterprise software solutions."
          },
        ],
        user_business_data: {
          company_name: "Your Business Name",
          about_us: "Brief description of what your business does",
          services: {
            "Service 1": "Description of service 1",
            "Service 2": "Description of service 2"
          },
          value_proposition: "What makes your business unique",
          clients: ["Client 1", "Client 2"],
          website: "https://yourbusiness.com"
        }
      };
    }

    const businessData = user?.user_metadata?.business_data || {
      company_name: "Your Business",
      about_us: "Information about your company would appear here",
      services: {
        "Service Category": "Service description would appear here"
      },
      value_proposition: "Your unique value proposition would appear here",
      clients: ["Example Client"],
      website: user?.user_metadata?.website_url || "https://example.com"
    };

    const searchData = {
      company_name: companySearch.company_name,
      website: companySearch.www || "https://example.com",
      industry: "Industry information would appear here",
      products: ["Product information would appear here"],
      founded: "Foundation year would appear here",
      employees: "Employee count would appear here",
      headquarters: "Headquarters location would appear here",
      revenue: "Revenue information would appear here",
      contact: companySearch.contact || null,
      email: companySearch.email || null,
      phone: companySearch.phone || null,
      role: companySearch.role || null
    };

    const questions = questionAnswers.map((qa) => ({
      id: qa.question_id,
      question: qa.agent_questions.question,
      answer: qa.answer || "No answer available"
    }));

    return {
      company_id: searchId,
      company_name: companySearch.company_name,
      search_data: searchData,
      questions: questions,
      user_business_data: businessData,
      expected_response: {
        score: "A number from 1-5 representing the fit/potential",
        advice: "Strategic advice for approaching this company",
        introduction: "A draft introduction message to send"
      }
    };
  };

  return {
    companySearch,
    questionAnswers,
    isLoading,
    isSaving,
    displayScore,
    setDisplayScore,
    displayAdvice,
    setDisplayAdvice,
    displayIntroduction,
    setDisplayIntroduction,
    displaySubject,
    setDisplaySubject,
    hasUnsavedChanges,
    handleSave,
    handleMagicSuccess,
    handleCopySuccess,
    adjustTextareaHeight,
    generateWebhookExampleBody
  };
};
