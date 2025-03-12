
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySearch } from '@/hooks/useCompanySearch';
import { Question } from '@/types/company';
import SearchForm from './SearchForm';
import QuestionsList from './QuestionsList';
import SearchResults from './SearchResults';
import { Card, CardContent } from '@/components/ui/card';

interface CompanySearchProps {
  questions: Question[];
  onSearch: () => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch }) => {
  const { userProfile } = useAuth();
  const mountedRef = useRef(true);
  
  const {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch,
    searchRequested,
    setSearchRequested,
    searchId
  } = useCompanySearch(questions, onSearch);

  // Set mounted ref to false when component unmounts
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Log detailed state information for debugging
    console.log("Search component state:", { 
      searchRequested, 
      isLoading, 
      hasResult: !!result, 
      companyName,
      searchId
    });
  }, [searchRequested, isLoading, result, companyName, searchId]);

  return (
    <div className="space-y-6">
      {isLoadingWebhook ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading company search tools...</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
          
          {searchRequested && (
            <div key={searchId} className="search-results-container">
              <SearchResults 
                result={result} 
                companyName={companyName} 
                questions={questions}
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompanySearch;
