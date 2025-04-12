
import { useState } from 'react';

export type WorkflowTab = 'mybusiness' | 'questions' | 'search' | 'valueproposition';

export const useWorkflowTabs = (defaultTab: WorkflowTab = 'mybusiness') => {
  const [activeTab, setActiveTab] = useState<WorkflowTab>(defaultTab);

  const getProgressPercentage = (): number => {
    switch (activeTab) {
      case 'mybusiness': return 25;
      case 'questions': return 50;
      case 'search': return 75;
      case 'valueproposition': return 100;
      default: return 0;
    }
  };

  return {
    activeTab,
    setActiveTab,
    getProgressPercentage
  };
};
