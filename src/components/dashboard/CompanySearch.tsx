
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySearch } from '@/hooks/useCompanySearch';
import { Question } from '@/types/company';
import SearchForm from './SearchForm';
import QuestionsList from './QuestionsList';
import SearchResults from './SearchResults';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CompanySearchProps {
  questions: Question[];
  onSearch: () => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch }) => {
  const { userProfile } = useAuth();
  const [displayedResult, setDisplayedResult] = useState(null);
  const [displayedSearchId, setDisplayedSearchId] = useState(null);
  const [isDisplayReady, setIsDisplayReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    companyName,
    setCompanyName,
    isLoading,
    isDeductingCredit,
    isLoadingWebhook,
    result,
    handleSearch,
    searchId,
    webhookUrl,
    lastError
  } = useCompanySearch(questions, onSearch);

  // Debug effect to log important state changes
  useEffect(() => {
    console.log("Search state update:", { 
      isLoading, 
      hasResult: !!result, 
      searchId, 
      webhookUrl,
      lastError 
    });
    
    // Update debug info
    let status = "";
    if (isLoadingWebhook) status = "Loading webhook configuration...";
    else if (!webhookUrl) status = "No webhook URL configured";
    else if (isLoading) status = "Search in progress...";
    else if (lastError) status = `Error: ${lastError}`;
    else if (result) status = "Search completed successfully";
    else status = "Ready to search";
    
    setDebugInfo(status);
  }, [isLoading, result, searchId, webhookUrl, isLoadingWebhook, lastError]);

  // Process and update displayedResult when search completes
  useEffect(() => {
    if (searchId && result) {
      console.log("Setting up displayed result", { hasResult: !!result });
      
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
      
      // Update the displayed result state
      setDisplayedResult(resultClone);
      setDisplayedSearchId(searchId);
      setIsDisplayReady(true);
    }
  }, [searchId, result]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset displayed results before starting a new search
    setDisplayedResult(null);
    setDisplayedSearchId(null);
    setIsDisplayReady(false);
    setDebugInfo("Starting search...");
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
          {/* Debug status display - Always visible */}
          <Alert variant={lastError ? "destructive" : "default"} className="mb-4">
            <AlertDescription className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{debugInfo}</span>
            </AlertDescription>
          </Alert>
          
          {!webhookUrl && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                No webhook URL is configured. Please contact the administrator.
              </AlertDescription>
            </Alert>
          )}
          
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
            style={{ minHeight: displayedResult ? '200px' : '0' }}
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
