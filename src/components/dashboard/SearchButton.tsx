import React from 'react';
import Button from '@/components/Button';
import { Loader2, Search } from 'lucide-react';
import { SearchState } from '@/hooks/useCompanySearch';

interface SearchButtonProps {
  isLoading: boolean;
  isProcessing: boolean;
  disabled: boolean;
  creditCost: number;
  questionsCount: number;
  searchState?: SearchState;
  isSearching?: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  isLoading,
  isProcessing,
  disabled,
  creditCost,
  questionsCount,
  searchState = SearchState.IDLE,
  isSearching = false
}) => {
  // Prioritize the direct isSearching flag over the searchState
  const showSearchingState = isSearching || searchState === SearchState.SEARCHING;

  let buttonText = "Search";
  if (showSearchingState) {
    buttonText = "Searching...";
  } else if (searchState === SearchState.ERROR) {
    buttonText = "Try Again";
  } else if (searchState === SearchState.COMPLETED) {
    buttonText = "Search Again";
  }

  return (
    <div className="flex items-center justify-between">
      <Button 
        type="submit" 
        disabled={disabled || showSearchingState}
        className={showSearchingState ? "animate-pulse" : ""}
        variant={searchState === SearchState.ERROR ? "secondary" : "primary"}
      >
        {showSearchingState ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          searchState === SearchState.IDLE && <Search className="mr-2 h-4 w-4" />
        )}
        {buttonText}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        <span>Cost: <span className="font-medium text-foreground">{creditCost} {creditCost === 1 ? 'credit' : 'credits'}</span></span>
        <p className="text-xs text-muted-foreground mt-1">({questionsCount} questions, 10 questions per credit)</p>
      </div>
    </div>
  );
};

export default SearchButton;
