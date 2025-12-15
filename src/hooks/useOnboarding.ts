import { useState, useEffect, useCallback, useMemo } from 'react';

const ONBOARDING_KEY = 'workflow_onboarding_completed';

export type WorkflowStep = 'mybusiness' | 'questions' | 'search' | 'valueproposition';

export interface WorkflowProgress {
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
}

export const useOnboarding = (workflowProgress?: WorkflowProgress) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      setShowOnboarding(true);
    }
    setIsLoaded(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  }, []);

  const showOnboardingAgain = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  // Calculate the first incomplete step based on workflow progress
  const firstIncompleteStep = useMemo((): WorkflowStep | null => {
    if (!workflowProgress) return 'mybusiness';
    
    if (!workflowProgress.businessProfileComplete) return 'mybusiness';
    if (!workflowProgress.questionsComplete) return 'questions';
    if (!workflowProgress.researchComplete) return 'search';
    if (!workflowProgress.valuePropositionComplete) return 'valueproposition';
    return null; // All complete
  }, [workflowProgress]);

  // Calculate completed step count
  const completedStepCount = useMemo(() => {
    if (!workflowProgress) return 0;
    return [
      workflowProgress.businessProfileComplete,
      workflowProgress.questionsComplete,
      workflowProgress.researchComplete,
      workflowProgress.valuePropositionComplete,
    ].filter(Boolean).length;
  }, [workflowProgress]);

  return {
    showOnboarding,
    isLoaded,
    completeOnboarding,
    resetOnboarding,
    showOnboardingAgain,
    firstIncompleteStep,
    completedStepCount,
  };
};

export default useOnboarding;
