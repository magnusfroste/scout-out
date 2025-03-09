
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSearchHistory = (onSearchDeleted: () => void) => {
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteSearch = async (id: string) => {
    setIsDeletingSearch(id);
    try {
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) throw answersError;
      
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      onSearchDeleted(); // Refresh the searches list
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSearch(null);
    }
  };

  return {
    isDeletingSearch,
    handleDeleteSearch
  };
};
