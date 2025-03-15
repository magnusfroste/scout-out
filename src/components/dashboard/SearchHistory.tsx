
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
  
  // Local delete handler that manages state directly - keeping for compatibility
  const handleDeleteSearch = async (id: string) => {
    // Now a stub function as delete button is removed
    console.log("Delete function called but delete button is removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research History</CardTitle>
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
            No research history found. Research a company to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchHistory;
