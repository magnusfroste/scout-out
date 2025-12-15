import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CreditDisplay from './CreditDisplay';
import { WorkflowStep } from '@/hooks/useOnboarding';

interface DashboardHeaderProps {
  firstName?: string;
  credits?: number;
  firstIncompleteStep: WorkflowStep | null;
  completedStepCount: number;
  onShowHelp: () => void;
}

const getNextStepMessage = (step: WorkflowStep | null): string => {
  switch (step) {
    case 'mybusiness':
      return 'Skapa din företagsprofil';
    case 'questions':
      return 'Lägg till frågor för research';
    case 'search':
      return 'Sök efter ett företag';
    case 'valueproposition':
      return 'Generera värdeproposition';
    default:
      return '';
  }
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  firstName,
  credits,
  firstIncompleteStep,
  completedStepCount,
  onShowHelp,
}) => {
  const greeting = firstName ? `Hej, ${firstName}!` : 'Välkommen!';
  const isAllComplete = completedStepCount === 4;
  const nextStepMessage = getNextStepMessage(firstIncompleteStep);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div className="flex items-start gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAllComplete ? (
              <span className="text-primary font-medium">🎉 Alla steg klara!</span>
            ) : (
              <>Nästa: {nextStepMessage}</>
            )}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onShowHelp}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visa introduktion</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {credits !== undefined && <CreditDisplay credits={credits} />}
    </div>
  );
};

export default DashboardHeader;
