
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuestionsListProps {
  questions: any[];
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions }) => {
  if (questions.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          These questions will be answered when you search for a company.
        </div>
        <ul className="space-y-2 list-disc pl-5">
          {questions.map(question => (
            <li key={question.id}>{question.question}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuestionsList;
