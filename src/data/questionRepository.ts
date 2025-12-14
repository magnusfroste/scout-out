/**
 * Question Repository - Data access for agent questions
 */

import { supabase } from '@/integrations/supabase/client';
import { AgentQuestion, AgentQuestionInsert, AgentQuestionUpdate } from '@/models/question';

export const questionRepository = {
  /**
   * Fetch all questions for a user
   */
  async findAllByUserId(userId: string): Promise<AgentQuestion[]> {
    const { data, error } = await supabase
      .from('agent_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
    
    return data || [];
  },

  /**
   * Create a single question
   */
  async create(question: AgentQuestionInsert): Promise<AgentQuestion | null> {
    const { data, error } = await supabase
      .from('agent_questions')
      .insert(question)
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return null;
    }
    
    return data;
  },

  /**
   * Create multiple questions at once
   */
  async createMany(questions: AgentQuestionInsert[]): Promise<AgentQuestion[]> {
    if (questions.length === 0) return [];

    const { data, error } = await supabase
      .from('agent_questions')
      .insert(questions)
      .select();

    if (error) {
      console.error('Error creating questions:', error);
      return [];
    }
    
    return data || [];
  },

  /**
   * Update a question
   */
  async update(id: string, userId: string, updates: AgentQuestionUpdate): Promise<boolean> {
    const { error } = await supabase
      .from('agent_questions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating question:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Delete a question
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }
    
    return true;
  }
};
