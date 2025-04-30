import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearchRecord, CompanyQuestionAnswer } from '@/types/company';

export const useCompanyDetail = (searchId: string, onUpdate?: (id: string, data: any) => void) => {
  const [companySearch, setCompanySearch] = useState<CompanySearchRecord | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<CompanyQuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayScore, setDisplayScore] = useState<number | null>(null);
  const [displayAdvice, setDisplayAdvice] = useState('');
  const [displayIntroduction, setDisplayIntroduction] = useState('');
  const [displaySubject, setDisplaySubject] = useState('');
  const [initialValues, setInitialValues] = useState({
    score: null as number | null,
    advice: '',
    introduction: '',
    subject: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage first, then from database
  useEffect(() => {
    if (searchId) {
      // Try to get values from localStorage
      const storedSubject = localStorage.getItem(`value_proposition_subject_${searchId}`);
      const storedIntro = localStorage.getItem(`value_proposition_intro_${searchId}`);
      const storedAdvice = localStorage.getItem(`value_proposition_advice_${searchId}`);
      
      if (storedSubject) setDisplaySubject(storedSubject);
      if (storedIntro) setDisplayIntroduction(storedIntro);
      if (storedAdvice) setDisplayAdvice(storedAdvice);
    }
  }, [searchId]);
  
  // Check for unsaved changes
  useEffect(() => {
    // Only check if we have company data and initialValues are set
    if (companySearch && (initialValues.subject !== '' || initialValues.introduction !== '' || initialValues.advice !== '')) {
      const hasChanges = 
        displaySubject !== initialValues.subject ||
        displayIntroduction !== initialValues.introduction ||
        displayAdvice !== initialValues.advice ||
        displayScore !== initialValues.score;
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [displaySubject, displayIntroduction, displayAdvice, displayScore, initialValues, companySearch]);

  // Fetch company search details
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
        
        // If no localStorage values, use database values
        if (!localStorage.getItem(`value_proposition_subject_${searchId}`)) {
          setDisplayScore(data.score);
          setDisplayAdvice(data.advice || '');
          setDisplayIntroduction(data.introduction || '');
          setDisplaySubject(data.subject || '');
        }
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
  
  // Handle the save action
  const handleSave = async () => {
    if (!searchId || !companySearch) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        score: displayScore,
        advice: displayAdvice,
        introduction: displayIntroduction,
        subject: displaySubject,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('company_searches')
        .update(updateData)
        .eq('id', searchId);
        
      if (error) throw error;
      
      // Update the initial values
      setInitialValues({
        score: displayScore,
        advice: displayAdvice,
        introduction: displayIntroduction,
        subject: displaySubject
      });
      
      // Update the company search in state
      setCompanySearch({
        ...companySearch,
        ...updateData
      });
      
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(searchId, updateData);
      }
      
    } catch (error: any) {
      console.error('Error saving company data:', error);
      toast({
        title: 'Error',
        description: `Failed to save changes: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle magic button success - Auto-save is now integrated in the ValuePropositionSection component
  const handleMagicSuccess = (score: number | null, advice: string | null, introduction: string | null, subject: string | null) => {
    if (score !== null) setDisplayScore(score);
    if (advice) setDisplayAdvice(advice);
    if (introduction) setDisplayIntroduction(introduction);
    if (subject) setDisplaySubject(subject);
    
    // Note: We don't auto-save here anymore, as it's handled in the ValuePropositionSection component
  };
  
  // Handle copy success
  const handleCopySuccess = () => {
    toast({
      title: 'Copied',
      description: 'Introduction copied to clipboard',
    });
  };
  
  // Function to adjust textarea height
  const adjustTextareaHeight = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchCompanySearch();
  }, [fetchCompanySearch]);
  
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
    adjustTextareaHeight
  };
};
