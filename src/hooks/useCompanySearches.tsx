/**
 * Hook for managing company searches
 * Uses the data layer for database operations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { companyRepository } from '@/data/companyRepository';
import { CompanySearch, CompanySearchUpdate } from '@/models/company';

// Re-export type for backward compatibility
export type { CompanySearch } from '@/models/company';

export function useCompanySearches() {
  const [searches, setSearches] = useState<CompanySearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSearches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Fetching searches for user:', user.id);
      const data = await companyRepository.findAllByUserId(user.id);
      console.log('Fetched searches:', data);
      setSearches(data);
    } catch (error: any) {
      console.error('Error fetching company searches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company searches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    if (!user) return;

    setIsDeleting(id);
    try {
      console.log('Deleting company search with ID:', id, 'for user:', user.id);
      await companyRepository.delete(id, user.id);
      console.log('Company search deleted successfully');

      setSearches(prevSearches => prevSearches.filter(search => search.id !== id));
      
      toast({
        title: 'Success',
        description: 'Company search deleted successfully',
      });
    } catch (error: any) {
      console.error('Error in deletion process:', error);
      toast({
        title: 'Error',
        description: `Failed to delete company search: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const updateSearchDetails = async (id: string, data: Partial<CompanySearch>) => {
    if (!user) return;

    try {
      console.log('Updating search details with data:', data);
      
      const updates: CompanySearchUpdate = {
        score: data.score,
        advice: data.advice,
        introduction: data.introduction,
        subject: data.subject
      };

      const success = await companyRepository.update(id, user.id, updates);

      if (!success) throw new Error('Update failed');

      setSearches(prevSearches => 
        prevSearches.map(search => 
          search.id === id ? { ...search, ...data } : search
        )
      );

      toast({
        title: 'Success',
        description: 'Company details updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating company search:', error);
      toast({
        title: 'Error',
        description: `Failed to update company search: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSearches();
    }
  }, [user]);

  return {
    searches,
    isLoading,
    isDeleting,
    fetchSearches,
    handleDeleteSearch,
    updateSearchDetails
  };
}
