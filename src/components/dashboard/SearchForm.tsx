import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import CompanyInput from './CompanyInput';
import SearchButton from './SearchButton';
import { calculateCreditCost } from '@/utils/creditUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import the SearchState enum
import { SearchState } from '@/hooks/useCompanySearch';

interface SearchFormProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  isLoading: boolean;
  isDeductingCredit: boolean;
  questionsCount: number;
  availableCredits?: number;
  onSubmit: (e: React.FormEvent) => void;
  searchState?: SearchState;
  errorMessage?: string | null;
  creditCost?: number; // Optional memoized credit cost
  isSearching?: boolean; // Add the direct flag
}

const SearchForm: React.FC<SearchFormProps> = ({
  companyName,
  setCompanyName,
  isLoading,
  isDeductingCredit,
  questionsCount,
  availableCredits,
  onSubmit,
  searchState = SearchState.IDLE,
  errorMessage,
  creditCost: propCreditCost, // Renamed to avoid conflict
  isSearching = false // Default to false
}) => {
  // Use provided credit cost or calculate it
  const creditCost = propCreditCost ?? calculateCreditCost(questionsCount);
  const insufficientCredits = availableCredits !== undefined && availableCredits < creditCost;

  // Determine if input should be disabled - use both flags
  const isDisabled = isSearching || searchState === SearchState.SEARCHING;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask Questions About a Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <CompanyInput 
            companyName={companyName}
            setCompanyName={setCompanyName}
            isDisabled={isDisabled}
          />
          
          <SearchButton 
            isLoading={isLoading}
            isProcessing={isDeductingCredit}
            disabled={questionsCount === 0 || insufficientCredits}
            creditCost={creditCost}
            questionsCount={questionsCount}
            searchState={searchState}
            isSearching={isSearching}
          />

          {insufficientCredits && (
            <div className="text-sm text-red-500 mt-2">
              You don't have enough credits for this search. Available: {availableCredits}, Required: {creditCost}
            </div>
          )}
        </form>
      </CardContent>
      
      {errorMessage && (
        <CardFooter className="pt-0">
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
};

export default SearchForm;
