
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
  // Initialize state with values from Supabase (via initialValues)
  const [displayScore, setDisplayScore] = useState<number | null>(initialValues.score);
  const [displayAdvice, setDisplayAdvice] = useState(initialValues.advice || '');
  const [displayIntroduction, setDisplayIntroduction] = useState(initialValues.introduction || '');
  const [displaySubject, setDisplaySubject] = useState(initialValues.subject || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Update display values when initialValues change (e.g., after fetching from database)
  useEffect(() => {
    console.log('Initial values changed in useValuePropositionState:', {
      score: initialValues.score,
      adviceLength: initialValues.advice?.length,
      introductionLength: initialValues.introduction?.length,
      subject: initialValues.subject
    });
    
    setDisplayScore(initialValues.score);
    setDisplayAdvice(initialValues.advice || '');
    setDisplayIntroduction(initialValues.introduction || '');
    setDisplaySubject(initialValues.subject || '');
  }, [initialValues]);
  
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
