
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ResultsDisplayProps {
  result: any;
  agentQuestions: any[];
  renderResults: () => React.ReactNode;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  agentQuestions,
  renderResults 
}) => {
  if (!result) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px]">
          {renderResults()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
