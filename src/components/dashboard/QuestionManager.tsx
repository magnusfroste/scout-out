
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  question: string;
};

interface QuestionManagerProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  userId: string | undefined;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, setQuestions, userId }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .insert([{ question: newQuestion, user_id: userId }])
        .select();
        
      if (error) throw error;
      
      setQuestions([...questions, data[0]]);
      setNewQuestion('');
      setIsQuestionDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error: any) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.question.trim() || !userId) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .update({ question: editingQuestion.question })
        .eq('id', editingQuestion.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ));
      setEditingQuestion(null);
      setIsQuestionDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setQuestions(questions.filter(q => q.id !== id));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Manage Questions</CardTitle>
          <Button 
            onClick={() => {
              setEditingQuestion(null);
              setNewQuestion('');
              setIsQuestionDialogOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            <div className="space-y-4 mt-4">
              {questions.map(question => (
                <div key={question.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="text-sm">{question.question}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question);
                        setIsQuestionDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No questions found. Add your first question to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={editingQuestion ? editingQuestion.question : newQuestion}
                onChange={(e) => 
                  editingQuestion 
                    ? setEditingQuestion({...editingQuestion, question: e.target.value})
                    : setNewQuestion(e.target.value)
                }
                placeholder="Enter your question here"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQuestionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={editingQuestion ? handleEditQuestion : handleAddQuestion}
              disabled={editingQuestion ? !editingQuestion.question.trim() : !newQuestion.trim()}
            >
              {editingQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionManager;
