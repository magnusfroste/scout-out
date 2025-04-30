
import React from 'react';
import { CompanySearch } from '@/hooks/useCompanySearches';
import Button from '@/components/Button';
import { Loader2, Trash2, Star, ChevronDown, ChevronRight, ChevronLeft, ExternalLink, Mail, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
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
  
  const renderEmailStatus = (sentEmailAt: string | null) => {
    if (!sentEmailAt) return null;
    
    return (
      <div className="flex items-center text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span className="text-xs">Email sent {format(new Date(sentEmailAt), 'MMM d')}</span>
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
            <TableHead className="w-[100px] text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searches.map((search) => (
            <React.Fragment key={search.id}>
              <TableRow 
                className="hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => onViewDetail(search.id)}
              >
                {onToggleRow && (
                  <TableCell 
                    className="pr-0 w-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleRow) onToggleRow(search.id);
                    }}
                  >
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
                      className="text-blue-600 hover:underline flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {search.www}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{search.contact || '-'}</span>
                    {search.sent_email_at && renderEmailStatus(search.sent_email_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-primary font-medium group-hover:underline inline-flex items-center">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </TableCell>
              </TableRow>
              
              {/* Expanded content row */}
              {expandedRows.has(search.id) && onToggleRow && (
                <TableRow 
                  className="bg-muted/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TableCell colSpan={7} className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Company Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {search.role && (
                          <div>
                            <span className="font-medium">Role:</span> {search.role}
                          </div>
                        )}
                        <div className="flex flex-col">
                          {search.email && (
                            <div className="flex items-start">
                              <span className="font-medium mr-2">Email:</span>
                              <div>
                                <a href={`mailto:${search.email}`} className="text-blue-600 hover:underline">
                                  {search.email}
                                </a>
                                {search.sent_email_at && (
                                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs mt-1">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span>Email sent on {format(new Date(search.sent_email_at), 'MMM d, yyyy')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
