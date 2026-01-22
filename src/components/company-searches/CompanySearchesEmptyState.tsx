import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanySearchesEmptyStateProps {
  onRefresh: () => void;
  onNavigateToSearch?: () => void;
}

const CompanySearchesEmptyState: React.FC<CompanySearchesEmptyStateProps> = ({
  onRefresh,
  onNavigateToSearch
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed rounded-lg bg-muted/20">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">No companies analyzed yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start by searching for a company in the Research tab. Your analyzed companies will appear here for further processing.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onNavigateToSearch && (
          <Button onClick={onNavigateToSearch} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Research
          </Button>
        )}
        <Button variant="outline" onClick={onRefresh} size="lg">
          Refresh
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
        Tip: The more questions you have defined, the better research you get on each company.
      </p>
    </div>
  );
};

export default CompanySearchesEmptyState;
