
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
  const [displayScore, setDisplayScore] = useState<number | null>(initialValues.score);
  const [displayAdvice, setDisplayAdvice] = useState(initialValues.advice || '');
  const [displayIntroduction, setDisplayIntroduction] = useState(initialValues.introduction || '');
  const [displaySubject, setDisplaySubject] = useState(initialValues.subject || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Only use localStorage for draft content that hasn't been saved yet
  // Always prioritize the server data that was passed in initialValues
  useEffect(() => {
    if (searchId) {
      // Only load from localStorage if the server data is empty
      if (!initialValues.subject) {
        const storedSubject = localStorage.getItem(`value_proposition_subject_${searchId}`);
        if (storedSubject) setDisplaySubject(storedSubject);
      }
      
      if (!initialValues.introduction) {
        const storedIntro = localStorage.getItem(`value_proposition_intro_${searchId}`);
        if (storedIntro) setDisplayIntroduction(storedIntro);
      }
      
      if (!initialValues.advice) {
        const storedAdvice = localStorage.getItem(`value_proposition_advice_${searchId}`);
        if (storedAdvice) setDisplayAdvice(storedAdvice);
      }
    }
  }, [searchId, initialValues]);
  
  // Save drafts to localStorage when they change
  useEffect(() => {
    if (searchId) {
      if (displaySubject !== initialValues.subject) {
        localStorage.setItem(`value_proposition_subject_${searchId}`, displaySubject);
      }
      
      if (displayIntroduction !== initialValues.introduction) {
        localStorage.setItem(`value_proposition_intro_${searchId}`, displayIntroduction);
      }
      
      if (displayAdvice !== initialValues.advice) {
        localStorage.setItem(`value_proposition_advice_${searchId}`, displayAdvice);
      }
    }
  }, [displaySubject, displayIntroduction, displayAdvice, searchId, initialValues]);
  
  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      displaySubject !== initialValues.subject ||
      displayIntroduction !== initialValues.introduction ||
      displayAdvice !== initialValues.advice ||
      displayScore !== initialValues.score;
    
    setHasUnsavedChanges(hasChanges);
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
