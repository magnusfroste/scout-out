
import React from 'react';
import { CompanySearch } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { Loader2, Trash2, Eye } from 'lucide-react';
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

  return (
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
  );
};

export default CompanySearchesListView;
