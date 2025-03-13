import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/types/search';

interface SearchHistoryItemProps {
  search: CompanySearch;
  isDeleting: boolean;
  onDelete: (id: string) => Promise<void>;
  isLoadingAnswers: boolean;
  searchAnswers?: any[];
  contactInfo?: any;
  onToggleExpand: (id: string) => void;
  isExpanded: boolean;
  onSearchDeleted: () => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({
  search,
  isDeleting,
  onDelete,
  isLoadingAnswers,
  searchAnswers,
  contactInfo,
  onToggleExpand,
  isExpanded,
  onSearchDeleted
}) => {
  const [localIsDeleting, setLocalIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Delete button clicked for search ID:", search.id);
    
    if (!search.id) {
      console.error("Cannot delete search: Invalid ID");
      return;
    }
    
    setLocalIsDeleting(true);
    
    try {
      // Direct approach: delete answers first
      console.log("Deleting answers for search ID:", search.id);
      await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', search.id);
      
      // Then delete the search
      console.log("Deleting search with ID:", search.id);
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', search.id);
      
      if (error) {
        console.error("Error deleting search:", error);
        throw error;
      }
      
      console.log("Search deleted successfully");
      setIsDeleted(true);
      
      // Notify parent to refresh the list
      onSearchDeleted();
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error) {
      console.error("Error in delete handler:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocalIsDeleting(false);
    }
  };
  
  if (isDeleted) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className={`p-4 cursor-pointer ${isExpanded ? 'bg-muted' : ''}`} 
        onClick={() => onToggleExpand(search.id)}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{search.company_name}</h3>
              {search.company_domain && (
                <Badge variant="outline" className="text-xs">
                  {search.company_domain}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || localIsDeleting}
            aria-label="Delete search"
            className="z-10 hover:bg-red-50 dark:hover:bg-red-900"
          >
            {(isDeleting || localIsDeleting) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-500" />
            )}
            <span className="ml-2">Delete</span>
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t">
          {isLoadingAnswers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : searchAnswers && searchAnswers.length > 0 ? (
            <div className="space-y-4">
              {searchAnswers.map((answer) => (
                <div key={answer.id} className="space-y-1">
                  <h4 className="font-medium text-sm">{answer.question}</h4>
                  <p className="text-sm">{answer.answer}</p>
                  <Separator className="my-2" />
                </div>
              ))}
              
              {contactInfo && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="font-medium text-sm mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    {contactInfo.email && (
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {contactInfo.email}
                      </p>
                    )}
                    {contactInfo.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        {contactInfo.phone}
                      </p>
                    )}
                    {contactInfo.address && (
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        {contactInfo.address}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No answers available for this search.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHistoryItem;
