
import { useState, useEffect } from 'react';
import { CompanySearchRecord, CompanyQuestionAnswer } from '@/types/company';
import { useFetchCompanyData } from './company-detail/useFetchCompanyData';
import { useValuePropositionState } from './company-detail/useValuePropositionState';
import { useSaveCompanyData } from './company-detail/useSaveCompanyData';
import { useCompanyDetailCallbacks } from './company-detail/useCompanyDetailCallbacks';

export const useCompanyDetail = (searchId: string, onUpdate?: (id: string, data: any) => void) => {
  // Fetch company data
  const { 
    companySearch, 
    questionAnswers, 
    isLoading, 
    initialValues,
    setInitialValues,
    refetchCompanyData
  } = useFetchCompanyData(searchId);
  
  // State for company search record
  const [companySearchState, setCompanySearchState] = useState<CompanySearchRecord | null>(companySearch);
  
  // Update companySearchState when companySearch changes
  useEffect(() => {
    if (companySearch) {
      setCompanySearchState(companySearch);
    }
  }, [companySearch]);
  
  // Value proposition state management
  const {
    displayScore,
    setDisplayScore,
    displayAdvice,
    setDisplayAdvice,
    displayIntroduction,
    setDisplayIntroduction,
    displaySubject,
    setDisplaySubject,
    hasUnsavedChanges,
    setHasUnsavedChanges
  } = useValuePropositionState(searchId, initialValues);
  
  // Save functionality
  const { 
    isSaving, 
    handleSave,
    debouncedSave
  } = useSaveCompanyData({
    searchId,
    companySearch: companySearchState || companySearch,
    setCompanySearch: setCompanySearchState,
    displayScore,
    displayAdvice,
    displayIntroduction,
    displaySubject,
    setHasUnsavedChanges,
    setInitialValues,
    onUpdate
  });
  
  // Various callbacks
  const {
    handleMagicSuccess,
    handleCopySuccess,
    adjustTextareaHeight
  } = useCompanyDetailCallbacks({
    setDisplayScore,
    setDisplayAdvice,
    setDisplayIntroduction,
    setDisplaySubject
  });
  
  return {
    companySearch: companySearchState || companySearch,
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
    debouncedSave,
    handleMagicSuccess,
    handleCopySuccess,
    adjustTextareaHeight,
    refetchCompanyData
  };
};
