import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Building, ListChecks, Search, Star, RefreshCw, Plus, Sparkles } from 'lucide-react';
import { WorkflowStep } from '@/hooks/useOnboarding';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface PendingProspect {
  id: string;
  companyName: string;
}

interface WorkflowStepperProps {
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
  activeStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  pendingProspect?: PendingProspect | null;
  onCreateProposal?: (prospectId: string) => void;
}

const setupSteps = [
  { 
    key: 'mybusiness' as WorkflowStep, 
    label: 'Profil', 
    icon: Building, 
    description: 'Beskriv ditt företag',
  },
  { 
    key: 'questions' as WorkflowStep, 
    label: 'Frågor', 
    icon: ListChecks, 
    description: 'Kvalificeringsfrågor',
  },
];

const prospectingSteps = [
  { 
    key: 'search' as WorkflowStep, 
    label: 'Research', 
    icon: Search, 
    description: 'Analysera prospekt',
  },
  { 
    key: 'valueproposition' as WorkflowStep, 
    label: 'Förslag', 
    icon: Star, 
    description: 'Skapa värdeförslag',
  },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  businessProfileComplete,
  questionsComplete,
  researchComplete,
  valuePropositionComplete,
  activeStep,
  onStepClick,
  pendingProspect,
  onCreateProposal,
}) => {
  const setupComplete = businessProfileComplete && questionsComplete;
  const setupCompletion = [businessProfileComplete, questionsComplete];
  const prospectingCompletion = [researchComplete, valuePropositionComplete];
  
  const isSetupPhase = activeStep === 'mybusiness' || activeStep === 'questions';
  const isProspectingPhase = activeStep === 'search' || activeStep === 'valueproposition';

  const renderStepButton = (
    step: typeof setupSteps[0], 
    isComplete: boolean, 
    isActive: boolean
  ) => {
    const Icon = step.icon;
    return (
      <Tooltip key={step.key}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onStepClick(step.key)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
              "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              isActive && "bg-primary/10 ring-1 ring-primary/30",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all shrink-0",
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
            <span className={cn(
              "text-sm hidden sm:block",
              isActive ? "font-medium" : "",
              isComplete ? "text-primary" : ""
            )}>
              {step.label}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{step.label}</p>
          <p className="text-xs text-muted-foreground">{step.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <TooltipProvider>
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            
            {/* Phase 1: Setup (One-time) */}
            <div className={cn(
              "flex-1 rounded-lg p-3 transition-all",
              setupComplete 
                ? "bg-primary/5 border border-primary/20" 
                : isSetupPhase 
                  ? "bg-muted/50 border border-border" 
                  : "bg-muted/30 border border-transparent"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {setupComplete ? (
                  <div className="flex items-center gap-1.5 text-primary">
                    <Check className="h-4 w-4" />
                    <span className="text-xs font-medium">Setup klar</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    Fas 1: Setup (en gång)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {setupSteps.map((step, index) => (
                  <React.Fragment key={step.key}>
                    {renderStepButton(step, setupCompletion[index], activeStep === step.key)}
                    {index < setupSteps.length - 1 && (
                      <div className={cn(
                        "w-4 h-0.5 rounded-full",
                        setupCompletion[index] ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Divider with arrow */}
            <div className="hidden sm:flex items-center justify-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                setupComplete ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Phase 2: Prospecting (Repeatable) */}
            <div className={cn(
              "flex-1 rounded-lg p-3 transition-all",
              isProspectingPhase 
                ? "bg-muted/50 border border-border" 
                : setupComplete 
                  ? "bg-muted/30 border border-transparent"
                  : "bg-muted/20 border border-transparent opacity-60"
            )}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Fas 2: Prospektera (upprepas)
                  </span>
                </div>
                
                {/* New Prospect Button - only show when setup is complete */}
                {setupComplete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStepClick('search')}
                        className="h-7 px-2 text-xs gap-1 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="hidden sm:inline">Ny prospekt</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Starta research på ett nytt företag</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {prospectingSteps.map((step, index) => (
                  <React.Fragment key={step.key}>
                    {renderStepButton(step, prospectingCompletion[index], activeStep === step.key)}
                    {index < prospectingSteps.length - 1 && (
                      <div className={cn(
                        "w-4 h-0.5 rounded-full",
                        prospectingCompletion[index] ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Pending prospect quick action */}
          {setupComplete && pendingProspect && onCreateProposal && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-accent/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate">
                    <span className="text-muted-foreground">Skapa förslag för </span>
                    <span className="font-medium">{pendingProspect.companyName}</span>
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onCreateProposal(pendingProspect.id)}
                  className="h-7 px-3 text-xs shrink-0"
                >
                  Skapa förslag
                </Button>
              </div>
            </div>
          )}

          {/* Current step hint - only show if setup not complete */}
          {!setupComplete && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                💡 Slutför din setup först – sen kan du researcha obegränsat antal prospekts!
              </p>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default WorkflowStepper;
