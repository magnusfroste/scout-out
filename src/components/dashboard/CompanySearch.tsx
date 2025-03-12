
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
  const [displayedResult, setDisplayedResult] = useState(null);
  const [displayedSearchId, setDisplayedSearchId] = useState(null);
  const [isDisplayReady, setIsDisplayReady] = useState(false);
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

  // Post-process and update displayedResult when search completes
  useEffect(() => {
    if (searchId && !isLoading && result) {
      // Delay setting results to ensure DOM stability
      setIsDisplayReady(false);
      
      // Post-process results - deep clone to prevent reference issues
      const resultClone = JSON.parse(JSON.stringify(result));
      
      // Ensure arrays and objects are properly initialized
      if (!resultClone.results) resultClone.results = [];
      if (!resultClone.contact_info) resultClone.contact_info = {};
      
      // Normalize all answer text fields
      resultClone.results = resultClone.results.map(answer => ({
        ...answer,
        answer: answer.answer ? String(answer.answer).trim() : ""
      }));
      
      // Use setTimeout to ensure the DOM has settled before updating
      const timer = setTimeout(() => {
        setDisplayedResult(resultClone);
        setDisplayedSearchId(searchId);
        
        // Give the browser another tick to process the state update
        requestAnimationFrame(() => {
          setIsDisplayReady(true);
        });
      }, 50); // Short delay to ensure DOM stability
      
      return () => clearTimeout(timer);
    }
  }, [searchId, isLoading, result]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset displayed results and display ready flag before starting a new search
    setDisplayedResult(null);
    setDisplayedSearchId(null);
    setIsDisplayReady(false);
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
          
          <div 
            ref={resultContainerRef} 
            className="search-results-wrapper"
            style={{ 
              minHeight: displayedResult && isDisplayReady ? '200px' : '0',
              opacity: isDisplayReady ? 1 : 0,
              transition: 'opacity 0.1s ease-in-out'
            }}
          >
            {displayedSearchId && displayedResult && (
              <SearchResults 
                key={displayedSearchId}
                result={displayedResult}
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
