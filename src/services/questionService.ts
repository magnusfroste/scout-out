
import { supabase } from '@/integrations/supabase/client';
import { fetchWebhookSettings } from './webhookService';
import { toast } from '@/hooks/use-toast';

export interface QuestionResponse {
  question: string;
  rationale: string;
}

/**
 * Fetches questions from the questions webhook URL stored in the webhook_settings table
 */
export const fetchQuestionsFromWebhook = async (websiteUrl: string): Promise<QuestionResponse[] | null> => {
  try {
    // Get the webhook settings to get the questions_url
    const webhookSettings = await fetchWebhookSettings();
    
    if (!webhookSettings || !webhookSettings.questions_url) {
      console.error('Questions webhook URL not configured:', webhookSettings);
      toast({
        title: "Error",
        description: "Questions webhook URL not configured. Please contact an administrator.",
        variant: "destructive",
      });
      return null;
    }
    
    console.log(`Fetching questions from webhook URL: ${webhookSettings.questions_url}`);
    
    // Create and log the request payload
    const requestPayload = { website_url: websiteUrl };
    console.log(`Request payload:`, requestPayload);
    
    // Make the API call to the questions webhook
    const response = await fetch(webhookSettings.questions_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    
    // Log the raw response for debugging
    const responseText = await response.text();
    console.log('Raw webhook response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Questions webhook request failed with status: ${response.status}, response: ${responseText}`);
    }
    
    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed questions webhook response:', responseData);
    } catch (parseError) {
      console.error('Error parsing webhook response:', parseError);
      throw new Error(`Invalid JSON response from webhook: ${responseText.substring(0, 100)}...`);
    }
    
    // Extract questions from the response - log each step for debugging
    console.log('Response is array?', Array.isArray(responseData));
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log('First item has output?', !!responseData[0].output);
      if (responseData[0].output) {
        console.log('Output has questions array?', Array.isArray(responseData[0].output.questions));
        if (Array.isArray(responseData[0].output.questions)) {
          return responseData[0].output.questions;
        }
      }
    }
    
    // Try alternative response formats
    if (Array.isArray(responseData)) {
      console.log('Trying alternative format - direct array of questions');
      if (responseData.length > 0 && 
          typeof responseData[0] === 'object' && 
          responseData[0].question) {
        return responseData;
      }
    } else if (responseData && typeof responseData === 'object') {
      console.log('Trying alternative format - object with questions array');
      if (Array.isArray(responseData.questions)) {
        return responseData.questions;
      } else if (responseData.output && Array.isArray(responseData.output.questions)) {
        return responseData.output.questions;
      }
    }
    
    // If we get here, we couldn't parse the response in any expected format
    console.error('Could not extract questions from response. Response structure:', JSON.stringify(responseData, null, 2));
    throw new Error('Invalid response format from questions webhook. Check console for details.');
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
    
    // Prepare the questions for insertion
    const questionsToInsert = questions.map(question => ({
      question,
      user_id: userId
    }));
    
    // Insert the questions
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
