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

    // First, check if this is wrapped in an edge function response
    let actualData = data;
    if (data && data.success && data.data) {
      console.log('Unwrapping edge function response');
      actualData = data.data;
    }

    // Extract questions from the response - handle multiple response formats
    let questions = null;
    
    // Format 1: Array with nested output.questions structure
    if (Array.isArray(actualData) && actualData.length > 0 && actualData[0].output && Array.isArray(actualData[0].output.questions)) {
      console.log('Parsing format: actualData[0].output.questions');
      questions = actualData[0].output.questions.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || '' // Map explanation to rationale
      }));
    }
    // Format 2: Direct questions array
    else if (actualData && Array.isArray(actualData.questions)) {
      console.log('Parsing format: actualData.questions');
      questions = actualData.questions.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || ''
      }));
    }
    // Format 3: Data itself is an array of questions
    else if (Array.isArray(actualData) && actualData.length > 0 && actualData[0].question) {
      console.log('Parsing format: direct array');
      questions = actualData.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || ''
      }));
    }

    if (questions && questions.length > 0) {
      console.log(`Successfully parsed ${questions.length} questions:`, questions);
      return questions;
    }

    console.error('Could not extract questions from response. Response structure:', JSON.stringify(data, null, 2));
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