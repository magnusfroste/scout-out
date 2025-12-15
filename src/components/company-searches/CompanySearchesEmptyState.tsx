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
      <h3 className="text-xl font-semibold mb-2 text-center">Inga företag analyserade ännu</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Börja med att söka efter ett företag i Research-fliken. Dina analyserade företag visas här för vidare bearbetning.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onNavigateToSearch && (
          <Button onClick={onNavigateToSearch} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Gå till Research
          </Button>
        )}
        <Button variant="outline" onClick={onRefresh} size="lg">
          Uppdatera
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
        Tips: Ju fler frågor du har definierat, desto bättre research får du om varje företag.
      </p>
    </div>
  );
};

export default CompanySearchesEmptyState;
