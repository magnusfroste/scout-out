import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Building, ListChecks, Search, Star } from 'lucide-react';
import { WorkflowStep } from '@/hooks/useOnboarding';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowProgressProps {
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
  activeStep?: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

interface StepIndicatorProps {
  label: string;
  icon: React.ElementType;
  isComplete: boolean;
  isActive: boolean;
  stepNumber: number;
  stepKey: WorkflowStep;
  hint: string;
  onClick?: () => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  label, 
  icon: Icon, 
  isComplete,
  isActive,
  stepNumber,
  hint,
  onClick,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all',
              isComplete
                ? 'bg-primary text-primary-foreground'
                : isActive
                  ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2'
                  : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'
            )}
          >
            {isComplete ? <Check className="h-3.5 w-3.5" /> : stepNumber}
          </div>
          <span className={cn(
            'text-sm hidden sm:inline transition-colors',
            isComplete 
              ? 'text-primary font-medium' 
              : isActive
                ? 'text-primary font-medium'
                : 'text-muted-foreground group-hover:text-foreground'
          )}>
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isComplete ? `✓ ${label} är klar` : hint}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  businessProfileComplete,
  questionsComplete,
  researchComplete,
  valuePropositionComplete,
  activeStep,
  onStepClick,
}) => {
  const completedSteps = [
    businessProfileComplete,
    questionsComplete,
    researchComplete,
    valuePropositionComplete,
  ].filter(Boolean).length;

  const progressPercentage = (completedSteps / 4) * 100;

  const steps: Array<{
    key: WorkflowStep;
    label: string;
    icon: React.ElementType;
    isComplete: boolean;
    hint: string;
  }> = [
    { 
      key: 'mybusiness', 
      label: 'Profil', 
      icon: Building, 
      isComplete: businessProfileComplete,
      hint: 'Fyll i din företagsprofil för att komma igång'
    },
    { 
      key: 'questions', 
      label: 'Frågor', 
      icon: ListChecks, 
      isComplete: questionsComplete,
      hint: 'Lägg till minst en fråga'
    },
    { 
      key: 'search', 
      label: 'Research', 
      icon: Search, 
      isComplete: researchComplete,
      hint: 'Sök efter och analysera ett företag'
    },
    { 
      key: 'valueproposition', 
      label: 'Förslag', 
      icon: Star, 
      isComplete: valuePropositionComplete,
      hint: 'Generera ett värdeförslag för ett företag'
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Din progress</h3>
        <span className={cn(
          "text-sm",
          completedSteps === 4 ? "text-primary font-medium" : "text-muted-foreground"
        )}>
          {completedSteps === 4 ? '🎉 Alla steg klara!' : `${completedSteps}/4 steg klara`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted mb-4 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            completedSteps === 4 ? "bg-gradient-to-r from-primary to-primary/80" : "bg-primary"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <StepIndicator
              label={step.label}
              icon={step.icon}
              isComplete={step.isComplete}
              isActive={activeStep === step.key}
              stepNumber={index + 1}
              stepKey={step.key}
              hint={step.hint}
              onClick={() => onStepClick?.(step.key)}
            />
            {index < steps.length - 1 && (
              <div className={cn(
                "h-px flex-1 mx-2 transition-colors",
                steps[index].isComplete ? "bg-primary" : "bg-border"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgress;