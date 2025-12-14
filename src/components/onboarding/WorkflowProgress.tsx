import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Building, ListChecks, Search, Star } from 'lucide-react';

interface WorkflowProgressProps {
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
}

interface StepIndicatorProps {
  label: string;
  icon: React.ElementType;
  isComplete: boolean;
  stepNumber: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  label, 
  icon: Icon, 
  isComplete,
  stepNumber 
}) => (
  <div className="flex items-center gap-2">
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all',
        isComplete
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isComplete ? <Check className="h-3.5 w-3.5" /> : stepNumber}
    </div>
    <span className={cn(
      'text-sm hidden sm:inline',
      isComplete ? 'text-primary font-medium' : 'text-muted-foreground'
    )}>
      {label}
    </span>
  </div>
);

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  businessProfileComplete,
  questionsComplete,
  researchComplete,
  valuePropositionComplete,
}) => {
  const completedSteps = [
    businessProfileComplete,
    questionsComplete,
    researchComplete,
    valuePropositionComplete,
  ].filter(Boolean).length;

  const progressPercentage = (completedSteps / 4) * 100;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Din progress</h3>
        <span className="text-sm text-muted-foreground">
          {completedSteps}/4 steg klara
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted mb-4">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        <StepIndicator
          label="Profil"
          icon={Building}
          isComplete={businessProfileComplete}
          stepNumber={1}
        />
        <div className="h-px flex-1 bg-border mx-2" />
        <StepIndicator
          label="Frågor"
          icon={ListChecks}
          isComplete={questionsComplete}
          stepNumber={2}
        />
        <div className="h-px flex-1 bg-border mx-2" />
        <StepIndicator
          label="Research"
          icon={Search}
          isComplete={researchComplete}
          stepNumber={3}
        />
        <div className="h-px flex-1 bg-border mx-2" />
        <StepIndicator
          label="Förslag"
          icon={Star}
          isComplete={valuePropositionComplete}
          stepNumber={4}
        />
      </div>
    </div>
  );
};

export default WorkflowProgress;
