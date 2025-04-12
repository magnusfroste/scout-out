
import React from 'react';
import { cn } from '@/lib/utils';
import { Building, ListChecks, Search, Star } from 'lucide-react';
import { WorkflowTab } from '@/hooks/useWorkflowTabs';

interface WorkflowDescriptionProps {
  activeTab: WorkflowTab;
}

const WorkflowDescription: React.FC<WorkflowDescriptionProps> = ({ activeTab }) => {
  return (
    <div className={cn(
      "p-5 rounded-lg text-sm border-l-4 shadow-sm transition-all duration-300",
      activeTab === 'mybusiness' ? "bg-primary/5 border-primary" :
      activeTab === 'questions' ? "bg-primary/5 border-primary" :
      activeTab === 'search' ? "bg-primary/5 border-primary" :
      "bg-primary/5 border-primary"
    )}>
      {activeTab === 'mybusiness' && (
        <div className="flex items-start">
          <Building className="h-5 w-5 mr-3 mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold text-base mb-1">Step 1: Set Up Your Business Profile</h3>
            <p className="text-muted-foreground">Your profile will be used by our AI agent when creating research questions.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'questions' && (
        <div className="flex items-start">
          <ListChecks className="h-5 w-5 mr-3 mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold text-base mb-1">Step 2: Manage Your Questions</h3>
            <p className="text-muted-foreground">Create and organize questions to ask potential clients. Use the Magic button to generate questions based on your website.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'search' && (
        <div className="flex items-start">
          <Search className="h-5 w-5 mr-3 mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold text-base mb-1">Step 3: Research Company</h3>
            <p className="text-muted-foreground">Gather insights about potential clients to discover opportunities for your business. Our AI analyzes companies to help you identify the best prospects and understand their needs.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'valueproposition' && (
        <div className="flex items-start">
          <Star className="h-5 w-5 mr-3 mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold text-base mb-1">Step 4: Value Proposition</h3>
            <p className="text-muted-foreground">Review your researched companies, rate their potential, and prepare your value proposition to approach them effectively.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDescription;
