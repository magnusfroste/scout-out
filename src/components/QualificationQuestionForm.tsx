
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { Loader2 } from 'lucide-react';

interface QualificationQuestionFormProps {
  editingQuestion?: any;
  onCancel: () => void;
}

const QualificationQuestionForm: React.FC<QualificationQuestionFormProps> = ({
  editingQuestion,
  onCancel,
}) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (editingQuestion) {
      setQuestion(editingQuestion.question || '');
    } else {
      setQuestion('');
    }
  }, [editingQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit questions',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('agent_questions')
          .update({
            question,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Question updated successfully',
        });
      } else {
        // Create new question
        const { error } = await supabase.from('agent_questions').insert({
          user_id: user.id,
          question,
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Question created successfully',
        });
      }

      // Reset form
      setQuestion('');
      onCancel();
    } catch (error: any) {
      console.error('Error submitting question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit question',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex space-x-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {editingQuestion ? 'Update' : 'Save'} Question
        </Button>
      </div>
    </form>
  );
};

export default QualificationQuestionForm;
