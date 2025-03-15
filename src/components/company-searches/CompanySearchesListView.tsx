import React from 'react';
import { CompanySearch } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { Loader2, Trash2, Eye, Star, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
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
  onDeleteSearch?: (id: string) => void;
  expandedRows?: Set<string>;
  onToggleRow?: (id: string) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const CompanySearchesListView: React.FC<CompanySearchesListViewProps> = ({
  searches,
  isDeleting,
  onViewDetail,
  onDeleteSearch,
  expandedRows = new Set(),
  onToggleRow,
  showBackButton = false,
  onBack
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
            {onToggleRow && <TableHead className="w-10"></TableHead>}
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
            <React.Fragment key={search.id}>
              <TableRow 
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${onToggleRow ? 'cursor-pointer' : ''}`}
                onClick={onToggleRow ? () => onToggleRow(search.id) : undefined}
              >
                {onToggleRow && (
                  <TableCell className="pr-0 w-10">
                    {expandedRows.has(search.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                )}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      {search.www}
                    </a>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {search.contact ? search.contact : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    {showBackButton && onBack && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="h-8 w-8 p-0"
                        aria-label="Go back"
                      >
                        <ChevronLeft className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(search.id)}
                      className="h-8 w-8 p-0"
                      aria-label="View detail"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    {onDeleteSearch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSearch(search.id)}
                        disabled={isDeleting === search.id}
                        className="h-8 w-8 p-0"
                        aria-label="Delete search"
                      >
                        {isDeleting === search.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              
              {/* Expanded content row */}
              {expandedRows.has(search.id) && onToggleRow && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={7} className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Company Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {search.role && (
                          <div>
                            <span className="font-medium">Role:</span> {search.role}
                          </div>
                        )}
                        {search.email && (
                          <div>
                            <span className="font-medium">Email:</span> {search.email}
                          </div>
                        )}
                        {search.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {search.phone}
                          </div>
                        )}
                        {search.answer_count > 0 && (
                          <div>
                            <span className="font-medium">Answers:</span> {search.answer_count}
                          </div>
                        )}
                      </div>
                      
                      {search.advice && (
                        <div className="mt-2">
                          <span className="font-medium">AI Advice:</span>
                          <p className="text-sm mt-1 line-clamp-3">{search.advice}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(search.id);
                          }}
                        >
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanySearchesListView;
