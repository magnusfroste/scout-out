
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchSortBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
}

const SearchSortBar = ({ 
  searchTerm, 
  setSearchTerm, 
  sortOption, 
  setSortOption 
}: SearchSortBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        />
      </div>
      <Select value={sortOption} onValueChange={setSortOption}>
        <SelectTrigger className="w-full sm:w-[220px] bg-gray-50 border-gray-200">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="az">Company Name (A-Z)</SelectItem>
          <SelectItem value="za">Company Name (Z-A)</SelectItem>
          <SelectItem value="score_high">Score (High to Low)</SelectItem>
          <SelectItem value="score_low">Score (Low to High)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchSortBar;
