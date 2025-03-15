import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useResearchHistory = (onSearchDeleted: () => void) => {
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteSearch = async (id: string) => {
    if (!id) {
      console.error("Invalid search ID provided");
      toast({
        title: "Error",
        description: "Invalid search ID",
        variant: "destructive",
      });
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setIsDeletingSearch(id);

    try {
      // First, delete related answers
      console.log(`Deleting answers for search ID: ${id}`);
      
      // Try direct delete for answers
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) {
        console.error('Error deleting answers:', answersError);
        // Continue with the process even if this fails
      } else {
        console.log('Successfully deleted answers');
      }

      // Then delete the search record
      console.log(`Deleting search record with ID: ${id}`);
      const { error: deleteError } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting search:', deleteError);
        throw new Error(`Failed to delete search: ${deleteError.message}`);
      }

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
