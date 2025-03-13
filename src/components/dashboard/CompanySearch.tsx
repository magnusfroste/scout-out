import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Globe,
  Mail,
  Phone,
  User,
  Search,
  Save,
  History as HistoryIcon,
  AlertTriangle,
} from 'lucide-react';
import { deductCredits } from '@/utils/creditUtils';
import { storeSearchResults } from '@/services/companySearchService';
import { parseWebhookResponse } from '@/utils/webhookResponseParser';
import QuestionsList from './QuestionsList';
import { supabase } from '@/integrations/supabase/client';

// Define types for our component
interface CompanySearchProps {
  questions: { id: string; question: string }[];
  onSearch: () => void; // Callback to refresh search history
  onNavigateToHistory?: () => void; // Optional callback to navigate to search history
}

// Result type for our component
interface SearchResult {
  companyName: string;
  contactInfo: {
    www?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  answers: {
    question: string;
    answer: string;
  }[];
}

const CompanySearch: React.FC<CompanySearchProps> = ({ questions, onSearch, onNavigateToHistory }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isProcessingCredits, setIsProcessingCredits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [rawResponseData, setRawResponseData] = useState<any>(null);
  const [parsedResults, setParsedResults] = useState<any>(null);

  // Credit cost for a search
  const CREDIT_COST = 1;

  // Process credits separately to avoid timing issues
  const processCredits = async (reason: string) => {
    if (!user || !userProfile) return false;
    
    setIsProcessingCredits(true);
    try {
      const success = await deductCredits(
        user.id,
        userProfile.credits,
        CREDIT_COST,
        reason,
        refreshUserProfile
      );
      
      if (success) {
        toast({
          title: "Credits Deducted",
          description: `${CREDIT_COST} credit was used for this search`,
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error processing credits:", error);
      return false;
    } finally {
      setIsProcessingCredits(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to search",
        variant: "destructive",
      });
      return;
    }

    if (userProfile.credits < CREDIT_COST) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${CREDIT_COST} credits for this search. You currently have ${userProfile.credits} credits.`,
        variant: "destructive",
      });
      return;
    }

    // Reset states
    setIsSearching(true);
    setSearchResult(null);
    setIsSaved(false);
    setRawResponseData(null);
    setParsedResults(null);

    try {
      // Notify user that search has started
      toast({
        title: "Search Started",
        description: "Searching for company data...",
      });

      // Get webhook settings from database
      const { data: webhookSettings } = await supabase
        .from('webhook_settings')
        .select('*')
        .single();
      
      if (!webhookSettings || !webhookSettings.url) {
        throw new Error("Webhook URL not configured. Please contact an administrator.");
      }
      
      // Import the webhook service
      const { callCompanyWebhook } = await import('@/services/companyWebhookService');
      
      // Make the actual API call using the webhook service
      console.log(`Making webhook call to ${webhookSettings.url} for company ${companyName}`);
      const response = await callCompanyWebhook(
        webhookSettings.url,
        companyName,
        questions
      );
      
      if (!response.ok) {
        throw new Error(`Webhook request failed with status: ${response.status}`);
      }
      
      // Parse the response
      const responseData = await response.json();
      console.log('Webhook response:', responseData);
      setRawResponseData(responseData);
      
      // Process the response data using the existing parser
      const { processedResults, contactInfo } = parseWebhookResponse(responseData);
      
      // Sort the processed results to match the order of questions
      const sortedResults = sortAnswersByQuestionOrder(processedResults);
      
      setParsedResults({ processedResults: sortedResults, contactInfo });
      
      if (sortedResults && sortedResults.length > 0) {
        // Format the result for our simple component
        const formattedResult: SearchResult = {
          companyName: companyName,
          contactInfo: contactInfo || {},
          answers: sortedResults.map(r => ({
            question: getQuestionText(r.question_id),
            answer: r.answer
          }))
        };
        
        // Set the search result to display it immediately
        setSearchResult(formattedResult);
        
        // Notify user that search is complete
        toast({
          title: "Search Complete",
          description: "Your search results are ready. Click 'Save' to save results and deduct credits.",
        });
      } else {
        throw new Error("No results found for this company");
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "There was an error processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Add a small delay before resetting the searching state
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  };

  // Helper function to get question text from question ID
  const getQuestionText = (questionId: string): string => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.question : `Question (ID: ${questionId})`;
  };

  // Helper function to sort answers according to the order of questions in the list
  const sortAnswersByQuestionOrder = (answers: { question_id: string, answer: string }[]): { question_id: string, answer: string }[] => {
    // Create a map of question IDs to their positions in the questions array
    const questionOrderMap = new Map<string, number>();
    questions.forEach((q, index) => {
      questionOrderMap.set(q.id, index);
    });

    // Sort the answers based on the order of questions
    return [...answers].sort((a, b) => {
      const orderA = questionOrderMap.get(a.question_id) ?? 999; // Default to high number if not found
      const orderB = questionOrderMap.get(b.question_id) ?? 999;
      return orderA - orderB;
    });
  };

  // Handle saving the search results and deducting credits
  const handleSaveResults = async () => {
    if (!user || !userProfile || !searchResult || !rawResponseData || !parsedResults) {
      toast({
        title: "Error",
        description: "Cannot save results. Missing required data.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Store the search result in the database
      await storeSearchResults(
        user.id,
        companyName,
        rawResponseData,
        parsedResults.processedResults,
        parsedResults.contactInfo
      );
      
      // Deduct credits after storing results
      const creditDeducted = await processCredits(`Simple company search: ${companyName}`);
      
      if (creditDeducted) {
        // Refresh search history
        onSearch();
        
        setIsSaved(true);
        
        toast({
          title: "Results Saved",
          description: "Your search results have been saved and credits deducted.",
        });
        
        // Navigate to search history after a short delay if the callback is provided
        if (onNavigateToHistory) {
          toast({
            title: "Redirecting",
            description: "Taking you to your search history...",
          });
          
          setTimeout(() => {
            onNavigateToHistory();
          }, 1500);
        }
      } else {
        toast({
          title: "Warning",
          description: "Failed to deduct credits, but results were saved.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewHistory = () => {
    onNavigateToHistory?.();
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Questions About a Company</CardTitle>
          <CardDescription>
            Search for a company to get contact information and key insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter company name to research"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isSearching || isProcessingCredits}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                disabled={!companyName || isSearching || isProcessingCredits || (userProfile && userProfile.credits < CREDIT_COST)}
                className={isSearching ? "animate-pulse" : ""}
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground text-right">
                <div>Cost: {CREDIT_COST} credit{CREDIT_COST !== 1 ? 's' : ''}</div>
                <div>({questions.length} questions, 10 questions per credit)</div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions List */}
      <QuestionsList questions={questions} />

      {/* Search Results */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results for {searchResult.companyName}</span>
              {isSaved && (
                <span className="text-sm font-normal text-green-600 dark:text-green-500 flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Results saved
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Contact Information */}
            {searchResult.contactInfo && Object.values(searchResult.contactInfo).some(Boolean) && (
              <div className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border relative">
                <h3 className="font-medium text-lg mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {!isSaved && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] text-red-500/20 text-4xl font-bold pointer-events-none select-none">
                      PREVIEW ONLY
                    </div>
                  )}
                  {searchResult.contactInfo.contact && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm ${!isSaved ? "select-none blur-[2px]" : ""}`}>
                        {isSaved 
                          ? searchResult.contactInfo.contact 
                          : searchResult.contactInfo.contact.substring(0, 5) + "•••••••"}
                      </span>
                    </div>
                  )}
                  {searchResult.contactInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isSaved ? (
                        <a href={`mailto:${searchResult.contactInfo.email}`} className="text-sm text-blue-600 hover:underline">
                          {searchResult.contactInfo.email}
                        </a>
                      ) : (
                        <span className="text-sm select-none blur-[2px]">
                          {searchResult.contactInfo.email.split('@')[0].substring(0, 3)}•••@•••.com
                        </span>
                      )}
                    </div>
                  )}
                  {searchResult.contactInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isSaved ? (
                        <a href={`tel:${searchResult.contactInfo.phone}`} className="text-sm text-blue-600 hover:underline">
                          {searchResult.contactInfo.phone}
                        </a>
                      ) : (
                        <span className="text-sm select-none blur-[2px]">
                          {searchResult.contactInfo.phone.substring(0, 3)}•••••••
                        </span>
                      )}
                    </div>
                  )}
                  {searchResult.contactInfo.www && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {isSaved ? (
                        <a 
                          href={searchResult.contactInfo.www.startsWith('http') ? searchResult.contactInfo.www : `https://${searchResult.contactInfo.www}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {searchResult.contactInfo.www}
                        </a>
                      ) : (
                        <span className="text-sm select-none blur-[2px]">
                          www.•••••.com
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Answers */}
            {searchResult.answers.length > 0 ? (
              <div className="space-y-4">
                {searchResult.answers.map((item, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800 relative">
                    <h3 className="font-medium text-lg mb-2">{item.question}</h3>
                    <div className="relative">
                      {!isSaved && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-800 z-10 flex flex-col justify-end items-center">
                          <p className="text-center p-2 text-sm text-muted-foreground">
                            Save results to view full content
                          </p>
                        </div>
                      )}
                      <p className={`text-sm whitespace-pre-wrap ${!isSaved ? "select-none blur-[2px]" : ""}`}>
                        {isSaved 
                          ? (item.answer || "No answer provided") 
                          : item.answer 
                            ? item.answer.substring(0, Math.min(150, item.answer.length)) + (item.answer.length > 150 ? "..." : "")
                            : "No answer provided"
                        }
                      </p>
                    </div>
                    {!isSaved && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] text-red-500/20 text-4xl font-bold pointer-events-none select-none">
                        PREVIEW ONLY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-center text-muted-foreground py-2">
                  The search was completed, but no detailed answers were found for this company.
                  {searchResult.contactInfo && Object.values(searchResult.contactInfo).some(Boolean) ? 
                    " Contact information is available above." : ""}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2 pb-4">
            {!isSaved ? (
              <Button 
                onClick={handleSaveResults} 
                disabled={isSaving || isProcessingCredits || (userProfile && userProfile.credits < CREDIT_COST)}
                className="w-full"
              >
                {isSaving || isProcessingCredits ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    {isProcessingCredits ? "Processing Credits..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Results ({CREDIT_COST} credit{CREDIT_COST !== 1 ? 's' : ''})
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleViewHistory}
                className="w-full"
              >
                <HistoryIcon className="mr-2 h-4 w-4" />
                View in Search History
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      
      {/* Not enough credits warning */}
      {userProfile && userProfile.credits < CREDIT_COST && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Not Enough Credits</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              You don't have enough credits to perform a search. Available: {userProfile.credits}, Required: {CREDIT_COST}.
              Please purchase more credits to continue using this feature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
