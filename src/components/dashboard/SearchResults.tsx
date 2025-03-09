
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Question = {
  id: string;
  question: string;
};

type Answer = {
  question_id: string;
  answer: string;
};

type SearchResults = {
  results?: Answer[];
};

interface SearchResultsProps {
  result: SearchResults | null;
  companyName: string;
  questions: Question[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ result, companyName, questions }) => {
  if (!result) return null;
  
  const renderResults = () => {
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-4">
          {result.results.map((item: Answer, index: number) => {
            const questionObj = questions.find(q => q.id === item.question_id);
            const questionText = questionObj ? questionObj.question : `Question ${index + 1}`;
            
            return (
              <div key={item.question_id || index} className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="font-medium text-lg mb-2">{questionText}</h3>
                <p className="text-sm whitespace-pre-wrap">{item.answer || "No answer provided"}</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results for {companyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px]">
          {renderResults()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
