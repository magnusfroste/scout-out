
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  question: string;
};

type CompanySearch = {
  id: string;
  company_name: string;
  created_at: string;
  result: any;
};

type CompanyAnswer = {
  id: string;
  company_search_id: string;
  question_id: string;
  answer: string | null;
  question?: string;
};

interface SearchHistoryProps {
  searches: CompanySearch[];
  isLoadingSearches: boolean;
  questions: Question[];
  onSearchDeleted: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  searches, 
  isLoadingSearches, 
  questions,
  onSearchDeleted 
}) => {
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const [expandedSearch, setExpandedSearch] = useState<string | null>(null);
  const [searchAnswers, setSearchAnswers] = useState<{[key: string]: CompanyAnswer[]}>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();

  const fetchAnswersForSearch = async (searchId: string) => {
    setIsLoadingAnswers(prev => ({ ...prev, [searchId]: true }));
    
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select('*')
        .eq('company_search_id', searchId);
        
      if (answersError) throw answersError;
      
      const answersWithQuestions = (answersData || []).map(answer => {
        const question = questions.find(q => q.id === answer.question_id);
        return {
          ...answer,
          question: question ? question.question : 'Unknown question'
        };
      });
      
      setSearchAnswers(prev => ({
        ...prev,
        [searchId]: answersWithQuestions
      }));
      
    } catch (error: any) {
      console.error('Error fetching answers:', error);
      toast({
        title: "Error",
        description: "Failed to load answers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnswers(prev => ({ ...prev, [searchId]: false }));
    }
  };

  const handleDeleteSearch = async (id: string) => {
    setIsDeletingSearch(id);
    try {
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) throw answersError;
      
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      onSearchDeleted(); // Refresh the searches list
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSearch(null);
    }
  };

  const toggleSearchExpand = (id: string) => {
    if (expandedSearch === id) {
      setExpandedSearch(null);
    } else {
      setExpandedSearch(id);
      if (!searchAnswers[id]) {
        fetchAnswersForSearch(id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingSearches ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : searches.length > 0 ? (
          <div className="space-y-4">
            {searches.map(search => (
              <div key={search.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  onClick={() => toggleSearchExpand(search.id)}
                >
                  <div className="flex items-center">
                    {expandedSearch === search.id ? (
                      <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 mr-2 text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-medium">{search.company_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(search.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSearch(search.id);
                    }}
                    disabled={isDeletingSearch === search.id}
                  >
                    {isDeletingSearch === search.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
                
                {expandedSearch === search.id && (
                  <div className="p-4 bg-white dark:bg-slate-900 border-t">
                    {isLoadingAnswers[search.id] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : searchAnswers[search.id] && searchAnswers[search.id].length > 0 ? (
                      <div className="space-y-4">
                        {searchAnswers[search.id].map((answer) => (
                          <div key={answer.id} className="border-l-4 border-slate-300 pl-3 py-1">
                            <h4 className="font-medium mb-1">{answer.question}</h4>
                            <p className="text-sm whitespace-pre-wrap">{answer.answer || "No answer provided"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-2">
                        No answers found for this search.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No search history found. Search for a company to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchHistory;
