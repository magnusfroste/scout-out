/**
 * Question Service - Business logic for agent questions
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { questionRepository } from '@/data/questionRepository';
import { QuestionResponse, AgentQuestionInsert } from '@/models/question';

// Re-export types for backward compatibility
export type { QuestionResponse } from '@/models/question';

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
    let questions: QuestionResponse[] | null = null;
    
    // Format 1: Direct output.questions structure (after edge function unwrapping)
    if (actualData && actualData.output && Array.isArray(actualData.output.questions)) {
      console.log('Parsing format: actualData.output.questions');
      questions = actualData.output.questions.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || ''
      }));
    }
    // Format 2: Array with nested output.questions structure
    else if (Array.isArray(actualData) && actualData.length > 0 && actualData[0].output && Array.isArray(actualData[0].output.questions)) {
      console.log('Parsing format: actualData[0].output.questions');
      questions = actualData[0].output.questions.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || ''
      }));
    }
    // Format 3: Direct questions array
    else if (actualData && Array.isArray(actualData.questions)) {
      console.log('Parsing format: actualData.questions');
      questions = actualData.questions.map((q: any) => ({
        question: q.question,
        rationale: q.explanation || q.rationale || ''
      }));
    }
    // Format 4: Data itself is an array of questions
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
    
    const questionsToInsert: AgentQuestionInsert[] = questions.map(question => ({
      question,
      user_id: userId
    }));
    
    const createdQuestions = await questionRepository.createMany(questionsToInsert);
      
    if (createdQuestions.length === 0) {
      throw new Error('Failed to create questions');
    }
    
    toast({
      title: "Success",
      description: `${createdQuestions.length} questions added successfully`,
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