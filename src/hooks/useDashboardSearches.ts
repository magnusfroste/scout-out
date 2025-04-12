
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanySearch } from '@/types/company';

export const useDashboardSearches = (userId: string | undefined) => {
  const [searches, setSearches] = useState<CompanySearch[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSearches = useCallback(async () => {
    if (!userId) {
      console.log("fetchSearches called but no user is logged in");
      return;
    }
    
    console.log("fetchSearches called - refreshing search history");
    setIsLoadingSearches(true);
    try {
      setSearches([]);
      
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching searches:', error);
        console.log('Error details:', JSON.stringify(error));
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} searches for user ${userId}`);
      
      if (data && data.length > 0) {
        console.log('Search IDs:', data.map(s => s.id).join(', '));
      }
      
      // Map returned data to CompanySearch type with all required properties
      const processedSearches: CompanySearch[] = (data || []).map(item => ({
        ...item,
        subject: item.subject || '',  // Provide default value for subject if it's missing
      }));
      
      setSearches(processedSearches);
    } catch (error: any) {
      console.error('Error fetching searches:', error);
      toast({
        title: "Error",
        description: "Failed to refresh search history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSearches(false);
    }
  }, [userId, toast]);

  const handleDeleteSearch = async (id: string) => {
    if (!id || !userId) {
      console.error("Invalid search ID or user not logged in");
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setIsDeletingSearch(id);

    try {
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) {
        console.error('Error deleting answers:', answersError);
        console.log('Error details:', JSON.stringify(answersError));
      } else {
        console.log('Successfully deleted answers');
      }

      const { error: deleteError } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting search:', deleteError);
        console.log('Error details:', JSON.stringify(deleteError));
        throw new Error(`Failed to delete search: ${deleteError.message}`);
      }

      console.log(`Successfully deleted search with ID: ${id}`);
      
      setSearches(prev => prev.filter(search => search.id !== id));
      
      await fetchSearches();
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error during delete operation:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
      
      fetchSearches();
    } finally {
      setIsDeletingSearch(null);
    }
  };

  return {
    searches,
    isLoadingSearches,
    isDeletingSearch,
    fetchSearches,
    handleDeleteSearch
  };
};
