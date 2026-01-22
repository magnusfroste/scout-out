
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import CompanySearchesList from '@/components/CompanySearchesList';
import { useCompanySearches } from '@/hooks/useCompanySearches';
import SearchSortBar from './value-proposition/SearchSortBar';
import GenerateAllButton from './value-proposition/GenerateAllButton';
import { filterAndSortSearches } from './value-proposition/utils';
import { useValuePropositionGenerator } from './value-proposition/ValuePropositionGenerator';

interface ValuePropositionTabProps {
  onDataChange?: () => void;
}

const ValuePropositionTab: React.FC<ValuePropositionTabProps> = ({ onDataChange }) => {
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const { searches, isLoading, isDeleting, handleDeleteSearch, fetchSearches } = useCompanySearches();

  const handleSuccess = () => {
    fetchSearches();
    onDataChange?.(); // Notify parent to refresh its state
  };

  const { generateAllPropositions } = useValuePropositionGenerator({
    onGenerateStart: () => setIsGeneratingAll(true),
    onGenerateEnd: () => setIsGeneratingAll(false),
    onSuccess: handleSuccess
  });

  const filteredAndSortedSearches = React.useMemo(() => 
    filterAndSortSearches(searches, searchTerm, sortOption), 
    [searches, searchTerm, sortOption]
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-semibold tracking-tight">Value Proposition</CardTitle>
          <CardDescription className="text-base">
            Review your researched companies, rate their potential, and prepare your approach.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <SearchSortBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          
          <CompanySearchesList 
            searches={filteredAndSortedSearches}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onDelete={handleDeleteSearch}
            onRefresh={fetchSearches}
            onBatchAction={(searches) => generateAllPropositions(searches)}
            showDeleteButton={false}
            showBackButton={false}
            batchActionButton={
              <GenerateAllButton 
                isGenerating={isGeneratingAll} 
                onClick={() => {}}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuePropositionTab;
