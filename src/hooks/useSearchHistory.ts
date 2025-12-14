/**
 * Hook for managing search/research history
 * Uses the data layer for database operations
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { companyRepository } from '@/data/companyRepository';

export const useResearchHistory = (onSearchDeleted: () => void) => {
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeleteSearch = async (id: string) => {
    if (!id || !user) {
      console.error("Invalid search ID or user not authenticated");
      toast({
        title: "Error",
        description: "Invalid search ID or not authenticated",
        variant: "destructive",
      });
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setIsDeletingSearch(id);

    try {
      await companyRepository.delete(id, user.id);
      console.log(`Successfully deleted search with ID: ${id}`);
      
      // Notify parent component to refresh the list
      onSearchDeleted();
      
      toast({
        title: 'Success',
        description: 'Research record deleted successfully',
      });
    } catch (error: any) {
      console.error('Error during delete operation:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete research record. Please try again.',
        variant: 'destructive',
      });
      
      // Try to refresh the list anyway
      console.log('Attempting to refresh list despite error');
      onSearchDeleted();
    } finally {
      setIsDeletingSearch(null);
    }
  };

  return {
    isDeletingSearch,
    handleDeleteSearch
  };
};

// Keep the old export name for backward compatibility
export const useSearchHistory = useResearchHistory;
