
import React, { useState, useEffect } from 'react';
import { CompanySearch } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { RefreshCw } from 'lucide-react';
import CompanySearchesLoadingState from './company-searches/CompanySearchesLoadingState';
import CompanySearchesEmptyState from './company-searches/CompanySearchesEmptyState';
import CompanySearchesListView from './company-searches/CompanySearchesListView';
import CompanySearchDetail from './CompanySearchDetail';

interface CompanySearchesListProps {
  searches: CompanySearch[];
  isLoading: boolean;
  isDeleting: string | null;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onBatchAction?: (searches: any[]) => void;
  batchActionButton?: React.ReactNode;
  showDeleteButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const CompanySearchesList = ({ 
  searches, 
  isLoading, 
  isDeleting, 
  onDelete, 
  onRefresh, 
  onBatchAction, 
  batchActionButton,
  showDeleteButton = false,
  showBackButton = false,
  onBack
}: CompanySearchesListProps) => {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleToggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Show company search detail if a search is selected
  if (selectedSearchId) {
    return (
      <CompanySearchDetail 
        searchId={selectedSearchId}
        onBack={() => {
          setSelectedSearchId(null);
          // Refresh the searches data when returning from detail view
          onRefresh();
        }}
        onUpdate={(id, data) => {
          // Check if data has stayOnPage flag
          if (data && data.stayOnPage) {
            // Just refresh data without navigating back to list
            onRefresh();
          } else {
            // When data is updated in detail view and no stayOnPage flag, refresh the searches data and return to list
            onRefresh();
            setSelectedSearchId(null);
          }
        }}
      />
    );
  }

  if (isLoading) {
    return <CompanySearchesLoadingState />;
  }

  if (searches.length === 0) {
    return <CompanySearchesEmptyState onRefresh={onRefresh} />;
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
        <Button variant="outline" onClick={onRefresh} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <CompanySearchesListView
          searches={searches}
          isDeleting={isDeleting}
          onViewDetail={setSelectedSearchId}
          onDeleteSearch={showDeleteButton ? onDelete : undefined}
          expandedRows={expandedRows}
          onToggleRow={handleToggleRow}
          showBackButton={showBackButton}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

export default CompanySearchesList;
