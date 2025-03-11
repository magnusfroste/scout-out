
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySearch } from '@/hooks/useCompanySearch';
import { SearchResultType } from '@/types/company';
import SearchForm from './SearchForm';
import QuestionsList from './QuestionsList';
import SearchResults from './SearchResults';

type Question = {
  id: string;
  question: string;
};

interface CompanySearchProps {
  questions: Question[];
  onSearch: () => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch }) => {
  const { userProfile } = useAuth();
  
  const {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    result,
    handleSearch
  } = useCompanySearch(questions, onSearch);

  return (
    <div className="space-y-6">
      <SearchForm 
        companyName={companyName}
        setCompanyName={setCompanyName}
        isLoading={isLoading}
        isDeductingCredit={isDeductingCredit}
        questionsCount={questions.length}
        availableCredits={userProfile?.credits}
        onSubmit={handleSearch}
      />
      
      <QuestionsList questions={questions} />
      
      {result && (
        <SearchResults 
          result={result} 
          companyName={companyName} 
          questions={questions} 
        />
      )}
    </div>
  );
};

export default CompanySearch;
