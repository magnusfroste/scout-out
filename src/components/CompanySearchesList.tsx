
import React, { useState } from 'react';
import { useCompanySearches } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { RefreshCw } from 'lucide-react';
import CompanySearchesLoadingState from './company-searches/CompanySearchesLoadingState';
import CompanySearchesEmptyState from './company-searches/CompanySearchesEmptyState';
import CompanySearchesListView from './company-searches/CompanySearchesListView';
import CompanySearchDetail from './CompanySearchDetail';

interface CompanySearchesListProps {
  onBatchAction?: (searches: any[]) => void;
  batchActionButton?: React.ReactNode;
}

const CompanySearchesList = ({ onBatchAction, batchActionButton }: CompanySearchesListProps) => {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const { searches, isLoading, isDeleting, fetchSearches, handleDeleteSearch, updateSearchDetails } = useCompanySearches();

  // Show company search detail if a search is selected
  if (selectedSearchId) {
    return (
      <CompanySearchDetail 
        searchId={selectedSearchId}
        onBack={() => setSelectedSearchId(null)}
        onUpdate={(id, data) => {
          updateSearchDetails(id, data);
          setSelectedSearchId(null);
        }}
      />
    );
  }

  if (isLoading) {
    return <CompanySearchesLoadingState />;
  }

  if (searches.length === 0) {
    return <CompanySearchesEmptyState onRefresh={fetchSearches} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          {batchActionButton && (
            <div onClick={() => onBatchAction && onBatchAction(searches)}>
              {batchActionButton}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={fetchSearches} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <CompanySearchesListView
          searches={searches}
          isDeleting={isDeleting}
          onViewDetail={setSelectedSearchId}
          onDeleteSearch={handleDeleteSearch}
        />
      </div>
    </div>
  );
};

export default CompanySearchesList;
