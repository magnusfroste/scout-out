
import React from 'react';
import { Loader2 } from 'lucide-react';
import { CompanyAnswer } from '@/hooks/useSearchAnswers';

interface SearchAnswersProps {
  searchId: string;
  isLoading: boolean;
  answers: CompanyAnswer[] | undefined;
}

const SearchAnswers: React.FC<SearchAnswersProps> = ({ 
  searchId,
  isLoading,
  answers
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  if (!answers || answers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-2">
        No answers found for this search.
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <div key={answer.id} className="border-l-4 border-slate-300 pl-3 py-1">
          <h4 className="font-medium mb-1">{answer.question}</h4>
          <p className="text-sm whitespace-pre-wrap">{answer.answer || "No answer provided"}</p>
        </div>
      ))}
    </div>
  );
};

export default SearchAnswers;
