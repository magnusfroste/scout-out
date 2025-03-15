
import React from 'react';
import { CompanySearch } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { Loader2, Trash2, Eye, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompanySearchesListViewProps {
  searches: CompanySearch[];
  isDeleting: string | null;
  onViewDetail: (id: string) => void;
  onDeleteSearch: (id: string) => void;
}

const CompanySearchesListView: React.FC<CompanySearchesListViewProps> = ({
  searches,
  isDeleting,
  onViewDetail,
  onDeleteSearch
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderScore = (score: number | null) => {
    if (score === null || score === undefined) return 'Not rated';
    
    // Display stars based on score (1-5)
    const normalizedScore = Math.max(0, Math.min(5, score));
    return (
      <div className="flex items-center">
        {[...Array(normalizedScore)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {[...Array(5 - normalizedScore)].map((_, i) => (
          <Star key={i + normalizedScore} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  // If no searches are available, show a message
  if (searches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No companies match your search criteria</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead>Company Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searches.map((search) => (
            <TableRow key={search.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell className="font-medium">{search.company_name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(search.created_at)}
              </TableCell>
              <TableCell>{renderScore(search.score)}</TableCell>
              <TableCell>
                {search.www ? (
                  <a 
                    href={search.www.startsWith('http') ? search.www : `https://${search.www}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {search.www}
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>
                {search.contact ? search.contact : '-'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(search.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSearch(search.id)}
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
  );
};

export default CompanySearchesListView;
