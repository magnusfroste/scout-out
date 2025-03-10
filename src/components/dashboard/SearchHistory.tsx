
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSearchAnswers } from '@/hooks/useSearchAnswers';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import SearchHistoryItem, { CompanySearch } from './SearchHistoryItem';

type Question = {
  id: string;
  question: string;
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
  const [expandedSearch, setExpandedSearch] = useState<string | null>(null);
  
  const { searchAnswers, contactInfo, isLoadingAnswers, fetchAnswersForSearch } = useSearchAnswers(questions);
  const { isDeletingSearch, handleDeleteSearch } = useSearchHistory(onSearchDeleted);

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
              <SearchHistoryItem
                key={search.id}
                search={search}
                isDeleting={isDeletingSearch === search.id}
                onDelete={handleDeleteSearch}
                isLoadingAnswers={!!isLoadingAnswers[search.id]}
                searchAnswers={searchAnswers[search.id]}
                contactInfo={contactInfo[search.id]}
                onToggleExpand={toggleSearchExpand}
                isExpanded={expandedSearch === search.id}
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
