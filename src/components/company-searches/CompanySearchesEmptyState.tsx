
import React from 'react';
import Button from '@/components/Button';
import { RefreshCw } from 'lucide-react';

interface CompanySearchesEmptyStateProps {
  onRefresh: () => void;
}

const CompanySearchesEmptyState: React.FC<CompanySearchesEmptyStateProps> = ({
  onRefresh
}) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">No company searches found</p>
      <Button variant="outline" onClick={onRefresh} size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default CompanySearchesEmptyState;
