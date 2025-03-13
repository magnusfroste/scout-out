import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSearchAnswers } from '@/hooks/useSearchAnswers';
import SearchHistoryItem from './SearchHistoryItem';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/types/search';

type Question = {
  id: string;
  question: string;
};

interface SearchHistoryProps {
  searches: CompanySearch[];
  isLoadingSearches: boolean;
  questions: Question[];
  onSearchDeleted: () => void;
  onDeleteSearch?: (id: string) => Promise<void>;
  isDeletingSearch: string | null;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  searches, 
  isLoadingSearches, 
  questions,
  onSearchDeleted,
  onDeleteSearch,
  isDeletingSearch: externalIsDeletingSearch
}) => {
  const [expandedSearch, setExpandedSearch] = useState<string | null>(null);
  const [localSearches, setLocalSearches] = useState<CompanySearch[]>(searches);
  const [localDeletingSearch, setLocalDeletingSearch] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { searchAnswers, contactInfo, isLoadingAnswers, fetchAnswersForSearch, clearSearchAnswers } = useSearchAnswers(questions);
  
  // Update local searches when the prop changes
  React.useEffect(() => {
    setLocalSearches(searches);
  }, [searches]);
  
  // Create a memoized callback for handling search deletion
  const handleSearchDeletedCallback = useCallback(() => {
    console.log("Search deleted callback triggered");
    // If the deleted search was expanded, collapse it
    if (expandedSearch && (externalIsDeletingSearch === expandedSearch || localDeletingSearch === expandedSearch)) {
      clearSearchAnswers(expandedSearch);
      setExpandedSearch(null);
    }
  }, [expandedSearch, externalIsDeletingSearch, localDeletingSearch, clearSearchAnswers]);
  
  // Set up an effect to handle post-deletion cleanup
  React.useEffect(() => {
    if (!externalIsDeletingSearch && !localDeletingSearch) {
      handleSearchDeletedCallback();
    }
  }, [externalIsDeletingSearch, localDeletingSearch, handleSearchDeletedCallback]);

  const toggleSearchExpand = (id: string) => {
    console.log("Toggling search expansion for ID:", id);
    if (expandedSearch === id) {
      setExpandedSearch(null);
    } else {
      setExpandedSearch(id);
      if (!searchAnswers[id]) {
        fetchAnswersForSearch(id);
      }
    }
  };
  
  // Local delete handler that manages state directly
  const handleDeleteSearch = async (id: string) => {
    if (!id) {
      console.error("Invalid search ID provided");
      toast({
        title: "Error",
        description: "Invalid search ID",
        variant: "destructive",
      });
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setLocalDeletingSearch(id);

    try {
      // If external delete handler is provided, use it
      if (onDeleteSearch) {
        await onDeleteSearch(id);
      } else {
        // Otherwise handle deletion locally
        // First, delete related answers
        console.log(`Deleting answers for search ID: ${id}`);
        const { error: answersError } = await supabase
          .from('company_question_answers')
          .delete()
          .eq('company_search_id', id);
        
        if (answersError) {
          console.error('Error deleting answers:', answersError);
          console.log('Error details:', JSON.stringify(answersError));
        } else {
          console.log('Successfully deleted answers');
        }

        // Then delete the search record
        console.log(`Deleting search record with ID: ${id}`);
        const { error: deleteError } = await supabase
          .from('company_searches')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting search:', deleteError);
          console.log('Error details:', JSON.stringify(deleteError));
          throw new Error(`Failed to delete search: ${deleteError.message}`);
        }
      }

      console.log(`Successfully deleted search with ID: ${id}`);
      
      // Update local state immediately
      setLocalSearches(prev => prev.filter(search => search.id !== id));
      
      // Notify parent component to refresh the list
      onSearchDeleted();
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error during delete operation:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
      
      // Try to refresh the list anyway
      onSearchDeleted();
    } finally {
      setLocalDeletingSearch(null);
    }
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
        ) : localSearches.length > 0 ? (
          <div className="space-y-4">
            {localSearches.map(search => (
              <SearchHistoryItem
                key={search.id}
                search={search}
                isDeleting={externalIsDeletingSearch === search.id || localDeletingSearch === search.id}
                onDelete={handleDeleteSearch}
                isLoadingAnswers={!!isLoadingAnswers[search.id]}
                searchAnswers={searchAnswers[search.id]}
                contactInfo={contactInfo[search.id]}
                onToggleExpand={toggleSearchExpand}
                isExpanded={expandedSearch === search.id}
                onSearchDeleted={onSearchDeleted}
              />
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
