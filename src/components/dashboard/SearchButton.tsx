
import React from 'react';
import Button from '@/components/Button';
import { Loader2 } from 'lucide-react';

interface SearchButtonProps {
  isLoading: boolean;
  isProcessing: boolean;
  disabled: boolean;
  creditCost: number;
  questionsCount: number;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  isLoading,
  isProcessing,
  disabled,
  creditCost,
  questionsCount
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button 
        type="submit" 
        disabled={disabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isProcessing ? "Processing response..." : "Searching company..."}
          </>
        ) : (
          "Search"
        )}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        <span>Cost: <span className="font-medium text-foreground">{creditCost} {creditCost === 1 ? 'credit' : 'credits'}</span></span>
        <p className="text-xs text-muted-foreground mt-1">({questionsCount} questions, 10 questions per credit)</p>
      </div>
    </div>
  );
};

export default SearchButton;
