
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CompanySearchesList = () => {
  const [searches, setSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSearches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
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
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSearches(searches.filter((search) => search.id !== id));
      toast({
        title: 'Success',
        description: 'Company search deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting company search:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company search',
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
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searches.map((search) => (
              <TableRow key={search.id}>
                <TableCell className="font-medium">{search.company_name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(search.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearch(search.id)}
                      disabled={isDeleting === search.id}
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
