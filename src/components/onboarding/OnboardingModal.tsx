import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building, ListChecks, Search, Star, ArrowRight, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/hooks/useOnboarding';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (navigateToStep?: WorkflowStep) => void;
  businessProfileComplete: boolean;
  questionsComplete: boolean;
  researchComplete: boolean;
  valuePropositionComplete: boolean;
  firstIncompleteStep: WorkflowStep | null;
  completedStepCount: number;
}

const getWelcomeContent = (completedCount: number, firstIncomplete: WorkflowStep | null) => {
  if (completedCount === 0) {
    return {
      title: 'Välkommen till ditt Research Workflow!',
      description: 'Låt oss guida dig genom de fyra stegen för att hitta och engagera potentiella kunder på ett smartare sätt.',
    };
  }
  
  if (completedCount === 4 || firstIncomplete === null) {
    return {
      title: 'Bra jobbat! Alla steg är klara!',
      description: 'Du har slutfört hela workflowen. Fortsätt att researcha fler företag och skapa värdeförslag.',
    };
  }
  
  const stepNames: Record<WorkflowStep, string> = {
    mybusiness: 'företagsprofilen',
    questions: 'frågorna',
    search: 'företagsresearch',
    valueproposition: 'värdeförslagen',
  };
  
  return {
    title: `Välkommen tillbaka! ${completedCount}/4 steg klara`,
    description: `Du är på god väg! Fortsätt med ${stepNames[firstIncomplete]} för att komma vidare.`,
  };
};

const workflowSteps = [
  {
    key: 'mybusiness' as WorkflowStep,
    icon: Building,
    title: 'Steg 1: Skapa din företagsprofil',
    description: 'Berätta om ditt företag så att vår AI kan skapa relevanta forskningsfrågor och anpassade värdeförslag.',
  },
  {
    key: 'questions' as WorkflowStep,
    icon: ListChecks,
    title: 'Steg 2: Hantera dina frågor',
    description: 'Skapa eller generera automatiskt frågor som hjälper dig förstå potentiella kunders behov.',
  },
  {
    key: 'search' as WorkflowStep,
    icon: Search,
    title: 'Steg 3: Researcha företag',
    description: 'Sök efter företag och låt vår AI analysera dem baserat på dina frågor för att identifiera möjligheter.',
  },
  {
    key: 'valueproposition' as WorkflowStep,
    icon: Star,
    title: 'Steg 4: Skapa värdeförslag',
    description: 'Generera personliga värdeförslag och förbered din approach till potentiella kunder.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  open, 
  onComplete,
  businessProfileComplete,
  questionsComplete,
  researchComplete,
  valuePropositionComplete,
  firstIncompleteStep,
  completedStepCount,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const stepCompletion = [businessProfileComplete, questionsComplete, researchComplete, valuePropositionComplete];
  const welcomeContent = getWelcomeContent(completedStepCount, firstIncompleteStep);
  
  // Total steps: intro (0) + 4 workflow steps (1-4)
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to the first incomplete step when finishing
      onComplete(firstIncompleteStep || 'mybusiness');
    }
  };

  const handleSkip = () => {
    onComplete(firstIncompleteStep || 'mybusiness');
  };

  const handleStartAtStep = (step: WorkflowStep) => {
    onComplete(step);
  };

  // Intro step
  if (currentStep === 0) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onComplete(firstIncompleteStep || 'mybusiness')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">{welcomeContent.title}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {welcomeContent.description}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : index < currentStep 
                      ? 'w-2 bg-primary/60'
                      : 'w-2 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Progress overview - show completed steps */}
          <div className="flex items-center justify-center gap-2 py-2">
            {workflowSteps.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => handleStartAtStep(step.key)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:scale-105',
                    stepCompletion[index]
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-muted hover:border-primary/50'
                  )}
                  title={`Gå till ${step.title}`}
                >
                  {stepCompletion[index] ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
                {index < 3 && (
                  <ArrowRight className={cn(
                    'h-4 w-4',
                    stepCompletion[index] ? 'text-primary' : 'text-muted-foreground/50'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Hoppa över
            </Button>
            <Button onClick={handleNext} className="gap-2">
              Visa stegen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Workflow step (1-4)
  const stepIndex = currentStep - 1;
  const currentStepData = workflowSteps[stepIndex];
  const Icon = currentStepData.icon;
  const isStepComplete = stepCompletion[stepIndex];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onComplete(firstIncompleteStep || 'mybusiness')}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            isStepComplete ? "bg-primary text-primary-foreground" : "bg-primary/10"
          )}>
            {isStepComplete ? (
              <Check className="h-8 w-8" />
            ) : (
              <Icon className={cn("h-8 w-8", isStepComplete ? "" : "text-primary")} />
            )}
          </div>
          <DialogTitle className="text-xl">
            {currentStepData.title}
            {isStepComplete && <span className="ml-2 text-primary">✓</span>}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isStepComplete 
              ? 'Du har slutfört detta steg! Klicka för att fortsätta eller revidera.'
              : currentStepData.description
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 py-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentStep 
                  ? 'w-8 bg-primary' 
                  : index < currentStep 
                    ? 'w-2 bg-primary/60'
                    : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Workflow preview */}
        <div className="flex items-center justify-center gap-2 py-2">
          {workflowSteps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  index === stepIndex
                    ? 'bg-primary text-primary-foreground border-primary scale-110'
                    : stepCompletion[index]
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-muted/50 text-muted-foreground border-muted'
                )}
              >
                {stepCompletion[index] && index !== stepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < 3 && (
                <ArrowRight className={cn(
                  'h-4 w-4',
                  stepCompletion[index] ? 'text-primary' : 'text-muted-foreground/50'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Hoppa över
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => handleStartAtStep(currentStepData.key)}
            >
              Gå hit
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep < totalSteps - 1 ? (
                <>
                  Nästa
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                'Kom igång!'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;