
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CompanySearchesList from './CompanySearchesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanySearches } from '@/hooks/useCompanySearches';
import { Skeleton } from '@/components/ui/skeleton';

const CompanySearchesTab = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const { searches, isLoading, isDeleting, handleDeleteSearch, fetchSearches } = useCompanySearches();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Company Searches
            {isLoading && (
              <div className="flex items-center">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="text-sm font-normal">Loading...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <CompanySearchesList 
              searches={searches} 
              isLoading={isLoading} 
              isDeleting={isDeleting}
              onDelete={handleDeleteSearch}
              onRefresh={fetchSearches}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySearchesTab;
