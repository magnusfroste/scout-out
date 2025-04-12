
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Building, ListChecks, Search, ArrowRight, Star } from 'lucide-react';
import { WorkflowTab } from '@/hooks/useWorkflowTabs';

interface WorkflowProgressProps {
  activeTab: WorkflowTab;
  setActiveTab: (tab: WorkflowTab) => void;
  progressPercentage: number;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  activeTab,
  setActiveTab,
  progressPercentage
}) => {
  return (
    <div className="mb-8 relative">
      <div className="mb-6">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/60 -z-10"></div>
        
        <div className="flex flex-col items-center z-10">
          <button 
            onClick={() => setActiveTab('mybusiness')}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
              activeTab === 'mybusiness' 
                ? "bg-primary text-primary-foreground border-primary scale-110" 
                : activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition'
                  ? "bg-primary/20 border-primary/30 text-primary" 
                  : "bg-background border-muted hover:border-muted-foreground"
            )}
          >
            <Building className="h-6 w-6" />
          </button>
          <span className={cn(
            "text-sm font-semibold mb-1",
            activeTab === 'mybusiness' 
              ? "text-primary" 
              : activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition'
                ? "text-primary/70"
                : "text-muted-foreground"
          )}>
            Step 1
          </span>
          <span className={cn(
            "text-xs",
            activeTab === 'mybusiness' ? "font-medium" : ""
          )}>Business Profile</span>
        </div>
        
        <div className={cn(
          "flex items-center transition-opacity duration-300",
          activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
        )}>
          <ArrowRight className="h-5 w-5" />
        </div>
        
        <div className="flex flex-col items-center z-10">
          <button 
            onClick={() => setActiveTab('questions')}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
              activeTab === 'questions' 
                ? "bg-primary text-primary-foreground border-primary scale-110" 
                : activeTab === 'search' || activeTab === 'valueproposition'
                  ? "bg-primary/20 border-primary/30 text-primary" 
                  : "bg-background border-muted hover:border-muted-foreground"
            )}
          >
            <ListChecks className="h-6 w-6" />
          </button>
          <span className={cn(
            "text-sm font-semibold mb-1",
            activeTab === 'questions' 
              ? "text-primary" 
              : activeTab === 'search' || activeTab === 'valueproposition'
                ? "text-primary/70"
                : "text-muted-foreground"
          )}>
            Step 2
          </span>
          <span className={cn(
            "text-xs",
            activeTab === 'questions' ? "font-medium" : ""
          )}>Questions</span>
        </div>
        
        <div className={cn(
          "flex items-center transition-opacity duration-300",
          activeTab === 'search' || activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
        )}>
          <ArrowRight className="h-5 w-5" />
        </div>
        
        <div className="flex flex-col items-center z-10">
          <button 
            onClick={() => setActiveTab('search')}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
              activeTab === 'search' 
                ? "bg-primary text-primary-foreground border-primary scale-110" 
                : activeTab === 'valueproposition'
                  ? "bg-primary/20 border-primary/30 text-primary" 
                  : "bg-background border-muted hover:border-muted-foreground"
            )}
          >
            <Search className="h-6 w-6" />
          </button>
          <span className={cn(
            "text-sm font-semibold mb-1",
            activeTab === 'search' 
              ? "text-primary" 
              : activeTab === 'valueproposition'
                ? "text-primary/70"
                : "text-muted-foreground"
          )}>
            Step 3
          </span>
          <span className={cn(
            "text-xs",
            activeTab === 'search' ? "font-medium" : ""
          )}>Research Company</span>
        </div>
        
        <div className={cn(
          "flex items-center transition-opacity duration-300",
          activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
        )}>
          <ArrowRight className="h-5 w-5" />
        </div>
        
        <div className="flex flex-col items-center z-10">
          <button 
            onClick={() => setActiveTab('valueproposition')}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
              activeTab === 'valueproposition' 
                ? "bg-primary text-primary-foreground border-primary scale-110" 
                : "bg-background border-muted hover:border-muted-foreground"
            )}
          >
            <Star className="h-6 w-6" />
          </button>
          <span className={cn(
            "text-sm font-semibold mb-1",
            activeTab === 'valueproposition' 
              ? "text-primary" 
              : "text-muted-foreground"
          )}>
            Step 4
          </span>
          <span className={cn(
            "text-xs",
            activeTab === 'valueproposition' ? "font-medium" : ""
          )}>Value Proposition</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;
