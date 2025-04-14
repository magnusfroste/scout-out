
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface QuestionAnswer {
  id: string;
  agent_questions: {
    id: string;
    question: string;
  };
  answer: string | null;
}

interface QuestionsAnswersSectionProps {
  questionAnswers: QuestionAnswer[];
}

const QuestionsAnswersSection: React.FC<QuestionsAnswersSectionProps> = ({
  questionAnswers
}) => {
  if (questionAnswers.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Questions & Answers</h3>
        <p className="text-muted-foreground">No questions or answers available for this company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Questions & Answers</h3>
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-5">
          <div className="space-y-6">
            {questionAnswers.map((qa) => (
              <div key={qa.id} className="pb-4">
                <h4 className="font-medium text-md mb-2">{qa.agent_questions.question}</h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="whitespace-pre-wrap text-sm">{qa.answer || 'No answer available'}</p>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionsAnswersSection;
