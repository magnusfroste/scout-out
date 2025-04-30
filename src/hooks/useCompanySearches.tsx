import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanySearch {
  id: string;
  company_name: string;
  created_at: string;
  user_id: string;
  result: any;
  answer_count: number;
  www?: string;
  contact?: string;
  email?: string;
  phone?: string;
  role?: string;
  score?: number;
  advice?: string;
  introduction?: string;
  subject?: string;
  sent_email_at?: string;
}

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
      const { data, error } = await supabase
        .from('company_searches')
        .select('*, company_question_answers(id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const searchesWithCounts = data?.map(search => ({
        ...search,
        answer_count: search.company_question_answers?.length || 0
      })) || [];
      
      console.log('Fetched searches:', searchesWithCounts);
      setSearches(searchesWithCounts);
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
      
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) {
        console.error('Error deleting related answers:', answersError);
        throw answersError;
      }
      
      console.log('Related answers deleted (if any)');

      const { error } = await supabase
        .from('company_searches')
        .delete()
        .match({ id: id, user_id: user.id });

      if (error) {
        console.error('Error deleting company search:', error);
        throw error;
      }
      
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
      
      const { error } = await supabase
        .from('company_searches')
        .update({
          score: data.score,
          advice: data.advice,
          introduction: data.introduction,
          subject: data.subject
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

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
