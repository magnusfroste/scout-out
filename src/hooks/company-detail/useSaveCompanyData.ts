/**
 * Hook for saving company data
 * Uses the data layer for database operations
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { companyRepository } from '@/data/companyRepository';
import { CompanySearchRecord } from '@/models/company';

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
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!searchId || !companySearch || !user) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        score: displayScore,
        advice: displayAdvice,
        introduction: displayIntroduction,
        subject: displaySubject
      };
      
      // Clear localStorage items before updating to prevent stale data
      localStorage.removeItem(`value_proposition_subject_${searchId}`);
      localStorage.removeItem(`value_proposition_intro_${searchId}`);
      localStorage.removeItem(`value_proposition_advice_${searchId}`);
      
      console.log('Saving to database with data:', updateData);
      
      // Use repository to update
      const success = await companyRepository.update(searchId, user.id, updateData);
      
      if (!success) throw new Error('Update failed');
      
      console.log('Database update successful');
      
      // Update the initial values to match the currently saved values
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
      
      // Call the onUpdate callback if provided, always with stayOnPage flag
      if (onUpdate) {
        // Pass data along with a flag indicating to stay on the page
        onUpdate(searchId, { 
          ...updateData,
          stayOnPage: true  // Always add this flag to stay on the page
        });
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

  return {
    isSaving,
    handleSave
  };
};
