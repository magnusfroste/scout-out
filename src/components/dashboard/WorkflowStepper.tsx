import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Building, ListChecks, Search, Star, ChevronRight } from 'lucide-react';
import { WorkflowStep } from '@/hooks/useOnboarding';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowStepperProps {
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
  activeStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
}

const steps = [
  { 
    key: 'mybusiness' as WorkflowStep, 
    label: 'Profil', 
    fullLabel: 'Företagsprofil',
    icon: Building, 
    hint: 'Fyll i din företagsprofil',
    description: 'Beskriv ditt företag så AI:n kan skapa relevanta frågor.',
  },
  { 
    key: 'questions' as WorkflowStep, 
    label: 'Frågor', 
    fullLabel: 'Frågor',
    icon: ListChecks, 
    hint: 'Lägg till minst en fråga',
    description: 'Skapa frågor för att förstå potentiella kunders behov.',
  },
  { 
    key: 'search' as WorkflowStep, 
    label: 'Research', 
    fullLabel: 'Research',
    icon: Search, 
    hint: 'Sök efter ett företag',
    description: 'Analysera företag för att hitta möjligheter.',
  },
  { 
    key: 'valueproposition' as WorkflowStep, 
    label: 'Förslag', 
    fullLabel: 'Värdeförslag',
    icon: Star, 
    hint: 'Skapa ett värdeförslag',
    description: 'Generera personliga värdeförslag för potentiella kunder.',
  },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  businessProfileComplete,
  questionsComplete,
  researchComplete,
  valuePropositionComplete,
  activeStep,
  onStepClick,
}) => {
  const stepCompletion = [businessProfileComplete, questionsComplete, researchComplete, valuePropositionComplete];
  const completedCount = stepCompletion.filter(Boolean).length;
  const progressPercentage = (completedCount / 4) * 100;
  
  const activeStepData = steps.find(s => s.key === activeStep) || steps[0];

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Compact progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Step navigation - horizontal on desktop, compact on mobile */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <TooltipProvider>
            {steps.map((step, index) => {
              const isComplete = stepCompletion[index];
              const isActive = activeStep === step.key;
              const Icon = step.icon;
              
              return (
                <React.Fragment key={step.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStepClick(step.key)}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all",
                          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isActive && "bg-primary/10 ring-1 ring-primary/30",
                        )}
                      >
                        {/* Icon with status */}
                        <div
                          className={cn(
                            "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all shrink-0",
                            isComplete
                              ? "bg-primary text-primary-foreground"
                              : isActive
                                ? "bg-primary/20 text-primary ring-2 ring-primary"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isComplete ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        
                        {/* Label - hidden on mobile, shown on sm+ */}
                        <div className="hidden sm:flex flex-col items-start">
                          <span className={cn(
                            "text-xs font-medium leading-none",
                            isComplete 
                              ? "text-primary" 
                              : isActive 
                                ? "text-foreground"
                                : "text-muted-foreground"
                          )}>
                            Steg {index + 1}
                          </span>
                          <span className={cn(
                            "text-sm leading-tight mt-0.5",
                            isActive ? "font-medium" : ""
                          )}>
                            {step.label}
                          </span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">{step.fullLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {isComplete ? '✓ Klar' : step.hint}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Connector - responsive */}
                  {index < steps.length - 1 && (
                    <ChevronRight className={cn(
                      "h-4 w-4 shrink-0",
                      stepCompletion[index] ? "text-primary" : "text-muted-foreground/40"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </TooltipProvider>
          
          {/* Progress badge - mobile only */}
          <div className="sm:hidden flex items-center gap-1 ml-1">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              completedCount === 4 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {completedCount}/4
            </span>
          </div>
        </div>
        
        {/* Active step description - collapsible hint */}
        <div className="mt-3 pt-3 border-t flex items-start gap-3">
          <activeStepData.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base">
              Steg {steps.findIndex(s => s.key === activeStep) + 1}: {activeStepData.fullLabel}
              {stepCompletion[steps.findIndex(s => s.key === activeStep)] && (
                <span className="ml-2 text-primary text-xs">✓</span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {activeStepData.description}
            </p>
          </div>
          
          {/* Desktop progress */}
          <div className="hidden sm:flex items-center gap-2 ml-auto shrink-0">
            <span className={cn(
              "text-sm font-medium",
              completedCount === 4 ? "text-primary" : "text-muted-foreground"
            )}>
              {completedCount === 4 ? '🎉 Alla klara!' : `${completedCount}/4 klara`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;