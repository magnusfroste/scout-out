
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CompanyInput from './CompanyInput';
import SearchButton from './SearchButton';
import { calculateCreditCost } from '@/utils/creditUtils';

interface SearchFormProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  isLoading: boolean;
  isDeductingCredit: boolean;
  questionsCount: number;
  availableCredits?: number;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  companyName,
  setCompanyName,
  isLoading,
  isDeductingCredit,
  questionsCount,
  availableCredits,
  onSubmit
}) => {
  const creditCost = calculateCreditCost(questionsCount);
  const insufficientCredits = availableCredits !== undefined && availableCredits < creditCost;

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
            isDisabled={isLoading}
          />
          
          <SearchButton 
            isLoading={isLoading}
            isProcessing={isDeductingCredit}
            disabled={isLoading || questionsCount === 0 || isDeductingCredit || insufficientCredits}
            creditCost={creditCost}
            questionsCount={questionsCount}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
