
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchAnswers from './SearchAnswers';
import { CompanyAnswer } from '@/hooks/useSearchAnswers';
import { ContactInfo } from '@/types/company';

export type CompanySearch = {
  id: string;
  company_name: string;
  created_at: string;
  result: any;
  contact_info?: ContactInfo;
};

interface SearchHistoryItemProps {
  search: CompanySearch;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  isLoadingAnswers: boolean;
  searchAnswers: CompanyAnswer[] | undefined;
  contactInfo?: ContactInfo;
  onToggleExpand: (id: string) => void;
  isExpanded: boolean;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({
  search,
  isDeleting,
  onDelete,
  isLoadingAnswers,
  searchAnswers,
  contactInfo,
  onToggleExpand,
  isExpanded
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 cursor-pointer"
        onClick={() => onToggleExpand(search.id)}
      >
        <div className="flex items-center">
          {isExpanded ? (
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
            onDelete(search.id);
          }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-red-500" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t">
          <SearchAnswers 
            searchId={search.id}
            isLoading={isLoadingAnswers}
            answers={searchAnswers}
            contactInfo={contactInfo}
          />
        </div>
      )}
    </div>
  );
};

export default SearchHistoryItem;
