
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AgentQuestionForm from './AgentQuestionForm';
import AgentQuestionsList from './AgentQuestionsList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AgentQuestions = () => {
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Questions</TabsTrigger>
          <TabsTrigger value="create">
            {editingQuestion ? 'Edit Question' : 'Create Question'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Your Qualification Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentQuestionsList onEditQuestion={handleEditQuestion} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgentQuestionForm
                editingQuestion={editingQuestion}
                onCancel={handleCancelEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentQuestions;
