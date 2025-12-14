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
import { Building, ListChecks, Search, Star, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: 'Välkommen till ditt Research Workflow!',
    description: 'Låt oss guida dig genom de fyra stegen för att hitta och engagera potentiella kunder på ett smartare sätt.',
    highlight: 'intro',
  },
  {
    icon: Building,
    title: 'Steg 1: Skapa din företagsprofil',
    description: 'Berätta om ditt företag så att vår AI kan skapa relevanta forskningsfrågor och anpassade värdeförslag.',
    highlight: 'mybusiness',
  },
  {
    icon: ListChecks,
    title: 'Steg 2: Hantera dina frågor',
    description: 'Skapa eller generera automatiskt frågor som hjälper dig förstå potentiella kunders behov.',
    highlight: 'questions',
  },
  {
    icon: Search,
    title: 'Steg 3: Researcha företag',
    description: 'Sök efter företag och låt vår AI analysera dem baserat på dina frågor för att identifiera möjligheter.',
    highlight: 'search',
  },
  {
    icon: Star,
    title: 'Steg 4: Skapa värdeförslag',
    description: 'Generera personliga värdeförslag och förbered din approach till potentiella kunder.',
    highlight: 'valueproposition',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
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

        {/* Workflow preview for non-intro steps */}
        {currentStep > 0 && (
          <div className="flex items-center justify-center gap-2 py-2">
            {[Building, ListChecks, Search, Star].map((StepIcon, index) => (
              <React.Fragment key={index}>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    index + 1 === currentStep
                      ? 'bg-primary text-primary-foreground border-primary scale-110'
                      : 'bg-muted/50 text-muted-foreground border-muted'
                  )}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                {index < 3 && (
                  <ArrowRight className={cn(
                    'h-4 w-4',
                    index + 1 < currentStep ? 'text-primary' : 'text-muted-foreground/50'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Hoppa över
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep < steps.length - 1 ? (
              <>
                Nästa
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              'Kom igång!'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
