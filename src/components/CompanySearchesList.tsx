
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import { Loader2, RefreshCw, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CompanySearchDetail from './CompanySearchDetail';

const CompanySearchesList = () => {
  const [searches, setSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSearches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_searches')
        .select('*, company_question_answers(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add a count of answers for each search
      const searchesWithCounts = data?.map(search => ({
        ...search,
        answer_count: search.company_question_answers?.length || 0
      })) || [];
      
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

  useEffect(() => {
    fetchSearches();
  }, [user]);

  const handleDeleteSearch = async (id: string) => {
    if (!user) return;

    setIsDeleting(id);
    try {
      console.log('Deleting company search with ID:', id);
      
      // First, check if there are any related answers
      const { data: answerCount, error: countError } = await supabase
        .from('company_question_answers')
        .select('id', { count: 'exact', head: true })
        .eq('company_search_id', id);
      
      if (countError) {
        console.error('Error checking for answers:', countError);
        throw countError;
      }
      
      console.log('Related answers count:', answerCount);
      
      // If there are related answers, delete them first
      if (answerCount && answerCount.length > 0) {
        console.log('Deleting related answers...');
        const { error: answersError } = await supabase
          .from('company_question_answers')
          .delete()
          .eq('company_search_id', id);
        
        if (answersError) {
          console.error('Error deleting answers:', answersError);
          throw answersError;
        }
        
        console.log('Related answers deleted successfully');
      }

      // Now delete the company search
      console.log('Now deleting the company search...');
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company search:', error);
        throw error;
      }
      
      console.log('Company search deleted successfully');

      // Remove the deleted search from the local state
      setSearches(prevSearches => prevSearches.filter(search => search.id !== id));
      
      toast({
        title: 'Success',
        description: 'Company search deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting company search:', error);
      toast({
        title: 'Error',
        description: `Failed to delete company search: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Show company search detail if a search is selected
  if (selectedSearchId) {
    return (
      <CompanySearchDetail 
        searchId={selectedSearchId}
        onBack={() => setSelectedSearchId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No company searches found</p>
        <Button variant="outline" onClick={fetchSearches} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchSearches} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Answers</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searches.map((search) => (
              <TableRow key={search.id}>
                <TableCell className="font-medium">{search.company_name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(search.created_at)}
                </TableCell>
                <TableCell>{search.answer_count}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSearchId(search.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearch(search.id)}
                      disabled={isDeleting === search.id}
                      className="h-8 w-8 p-0"
                    >
                      {isDeleting === search.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompanySearchesList;
