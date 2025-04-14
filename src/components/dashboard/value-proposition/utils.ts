
import { CompanySearch } from '@/hooks/useCompanySearches';

export const filterAndSortSearches = (
  searches: CompanySearch[], 
  searchTerm: string, 
  sortOption: string
): CompanySearch[] => {
  const filtered = searches.filter(search => 
    search.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (search.contact && search.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (search.email && search.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'az':
        return a.company_name.localeCompare(b.company_name);
      case 'za':
        return b.company_name.localeCompare(a.company_name);
      case 'score_high':
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
      case 'score_low':
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return a.score - b.score;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
};
