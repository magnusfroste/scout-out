
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuestionsListProps {
  questions: { id: string; question: string; }[];
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions }) => {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No questions available. Please add questions in the Manage Questions tab first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions We'll Ask ({questions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-2">
          {questions.map(question => (
            <li key={question.id} className="text-sm">
              {question.question}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

export default QuestionsList;
