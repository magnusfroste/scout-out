
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearchRecord } from '@/types/company';

interface UseSaveCompanyDataProps {
  searchId: string;
  companySearch: CompanySearchRecord | null;
  setCompanySearch: (data: CompanySearchRecord | null) => void;
  displayScore: number | null;
  displayAdvice: string;
  displayIntroduction: string;
  displaySubject: string;
  setHasUnsavedChanges: (value: boolean) => void;
  setInitialValues?: (values: any) => void;
  onUpdate?: (id: string, data: any) => void;
}

interface UseSaveCompanyDataReturn {
  isSaving: boolean;
  handleSave: () => Promise<void>;
  debouncedSave: () => void;
}

export const useSaveCompanyData = ({
  searchId,
  companySearch,
  setCompanySearch,
  displayScore,
  displayAdvice,
  displayIntroduction,
  displaySubject,
  setHasUnsavedChanges,
  setInitialValues,
  onUpdate
}: UseSaveCompanyDataProps): UseSaveCompanyDataReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
      
      // Update the initial values if setter is provided
      if (setInitialValues) {
        setInitialValues({
          score: displayScore,
          advice: displayAdvice,
          introduction: displayIntroduction,
          subject: displaySubject
        });
      }
      
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

  // Debounced save function - will save after 2 seconds of inactivity
  const debouncedSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      if (searchId && companySearch) {
        handleSave();
      }
    }, 2000);
    
    setSaveTimeout(timeoutId);
  }, [searchId, companySearch, displayScore, displayAdvice, displayIntroduction, displaySubject]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    isSaving,
    handleSave,
    debouncedSave
  };
};
