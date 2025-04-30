
import { useState, useEffect } from 'react';

interface ValuePropositionState {
  displayScore: number | null;
  setDisplayScore: (score: number | null) => void;
  displayAdvice: string;
  setDisplayAdvice: (advice: string) => void;
  displayIntroduction: string;
  setDisplayIntroduction: (intro: string) => void;
  displaySubject: string;
  setDisplaySubject: (subject: string) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

interface InitialValues {
  score: number | null;
  advice: string;
  introduction: string;
  subject: string;
}

export const useValuePropositionState = (
  searchId: string, 
  initialValues: InitialValues
): ValuePropositionState => {
  const [displayScore, setDisplayScore] = useState<number | null>(null);
  const [displayAdvice, setDisplayAdvice] = useState('');
  const [displayIntroduction, setDisplayIntroduction] = useState('');
  const [displaySubject, setDisplaySubject] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load data from localStorage first, then from initialValues
  useEffect(() => {
    if (searchId) {
      // Try to get values from localStorage
      const storedSubject = localStorage.getItem(`value_proposition_subject_${searchId}`);
      const storedIntro = localStorage.getItem(`value_proposition_intro_${searchId}`);
      const storedAdvice = localStorage.getItem(`value_proposition_advice_${searchId}`);
      
      // Set values from localStorage if available, otherwise from initialValues
      setDisplaySubject(storedSubject || initialValues.subject);
      setDisplayIntroduction(storedIntro || initialValues.introduction);
      setDisplayAdvice(storedAdvice || initialValues.advice);
      setDisplayScore(initialValues.score);
    }
  }, [searchId, initialValues]);
  
  // Check for unsaved changes
  useEffect(() => {
    // Only check if we have initial values
    if (initialValues.subject !== '' || initialValues.introduction !== '' || initialValues.advice !== '') {
      const hasChanges = 
        displaySubject !== initialValues.subject ||
        displayIntroduction !== initialValues.introduction ||
        displayAdvice !== initialValues.advice ||
        displayScore !== initialValues.score;
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [displaySubject, displayIntroduction, displayAdvice, displayScore, initialValues]);

  return {
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
  };
};
