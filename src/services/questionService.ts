import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface QuestionResponse {
  question: string;
  rationale: string;
}

/**
 * Fetches questions from the questions webhook via Supabase Edge Function
 */
export const fetchQuestionsFromWebhook = async (websiteUrl: string): Promise<QuestionResponse[] | null> => {
  try {
    console.log('Fetching questions via edge function for:', websiteUrl);

    const { data, error } = await supabase.functions.invoke('trigger-questions-webhook', {
      body: { websiteUrl }
    });

    if (error) {
      console.error('Edge function error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions from webhook",
        variant: "destructive",
      });
      return null;
    }

    console.log('Questions response:', data);

    // Extract questions from the response
    if (data && Array.isArray(data.questions)) {
      return data.questions;
    } else if (Array.isArray(data)) {
      return data;
    }

    console.error('Invalid response format from questions webhook');
    return null;
  } catch (error: any) {
    console.error('Error fetching questions from webhook:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to fetch questions from webhook",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Adds multiple questions to the agent_questions table
 */
export const addMultipleQuestions = async (questions: string[], userId: string): Promise<boolean> => {
  try {
    if (!questions.length || !userId) {
      return false;
    }
    
    const questionsToInsert = questions.map(question => ({
      question,
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from('agent_questions')
      .insert(questionsToInsert)
      .select();
      
    if (error) {
      throw error;
    }
    
    toast({
      title: "Success",
      description: `${data.length} questions added successfully`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error adding questions:', error);
    toast({
      title: "Error",
      description: "Failed to add questions",
      variant: "destructive",
    });
    return false;
  }
};