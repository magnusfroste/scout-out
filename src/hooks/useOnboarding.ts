import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'workflow_onboarding_completed';

export const useOnboarding = () => {
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

  return {
    showOnboarding,
    isLoaded,
    completeOnboarding,
    resetOnboarding,
  };
};

export default useOnboarding;
