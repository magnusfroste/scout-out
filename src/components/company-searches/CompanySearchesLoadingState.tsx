
import React from 'react';
import { Loader2 } from 'lucide-react';

const CompanySearchesLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default CompanySearchesLoadingState;
