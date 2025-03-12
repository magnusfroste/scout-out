
import React, { useState, useEffect, useRef } from 'react';
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
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch,
    searchId
  } = useCompanySearch(questions, onSearch);

  // Update activeSearchId when search is completed
  useEffect(() => {
    if (searchId && !isLoading && result) {
      // Use setTimeout to ensure DOM is ready before updating
      setTimeout(() => {
        setActiveSearchId(searchId);
      }, 0);
    }
  }, [searchId, isLoading, result]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  };

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
            onSubmit={handleFormSubmit}
          />
          
          <QuestionsList questions={questions} />
          
          <div ref={resultContainerRef} className="search-results-wrapper">
            {activeSearchId && (
              <SearchResults 
                key={activeSearchId}
                result={result} 
                companyName={companyName} 
                questions={questions}
                isLoading={isLoading}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CompanySearch;
