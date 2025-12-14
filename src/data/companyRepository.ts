/**
 * Company Repository - Data access for company searches
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  CompanySearchRecord, 
  CompanySearchInsert, 
  CompanySearchUpdate,
  CompanyQuestionAnswerInsert,
  CompanyQuestionAnswer,
  CompanySearch
} from '@/models/company';

export const companyRepository = {
  /**
   * Fetch all company searches for a user
   */
  async findAllByUserId(userId: string): Promise<CompanySearch[]> {
    const { data, error } = await supabase
      .from('company_searches')
      .select('*, company_question_answers(id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(search => ({
      ...search,
      answer_count: search.company_question_answers?.length || 0
    })) || [];
  },

  /**
   * Fetch a single company search by ID
   */
  async findById(id: string): Promise<CompanySearchRecord | null> {
    const { data, error } = await supabase
      .from('company_searches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as CompanySearchRecord;
  },

  /**
   * Create a new company search
   */
  async create(searchData: CompanySearchInsert): Promise<string | null> {
    const { data, error } = await supabase
      .from('company_searches')
      .insert({
        user_id: searchData.user_id,
        company_name: searchData.company_name,
        result: searchData.result,
        created_at: searchData.created_at,
        contact_info: searchData.contact_info as any,
        www: searchData.www,
        contact: searchData.contact,
        email: searchData.email,
        phone: searchData.phone,
        role: searchData.role,
        subject: searchData.subject,
        score: searchData.score,
        advice: searchData.advice,
        introduction: searchData.introduction
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating company search:', error);
      return null;
    }
    
    return data?.id || null;
  },

  /**
   * Update a company search
   */
  async update(id: string, userId: string, updates: CompanySearchUpdate): Promise<boolean> {
    const { error } = await supabase
      .from('company_searches')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating company search:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Delete a company search and its related answers
   */
  async delete(id: string, userId: string): Promise<boolean> {
    // First delete related answers
    const { error: answersError } = await supabase
      .from('company_question_answers')
      .delete()
      .eq('company_search_id', id);
    
    if (answersError) {
      console.error('Error deleting related answers:', answersError);
      throw answersError;
    }

    // Then delete the search
    const { error } = await supabase
      .from('company_searches')
      .delete()
      .match({ id, user_id: userId });

    if (error) {
      console.error('Error deleting company search:', error);
      throw error;
    }
    
    return true;
  },

  /**
   * Create multiple question answers for a company search
   */
  async createAnswers(answers: CompanyQuestionAnswerInsert[]): Promise<boolean> {
    if (answers.length === 0) return true;

    const { error } = await supabase
      .from('company_question_answers')
      .insert(answers);

    if (error) {
      console.error('Error creating answers:', error);
      return false;
    }
    
    return true;
  },

  /**
   * Fetch question answers for a company search
   */
  async findAnswersBySearchId(searchId: string): Promise<CompanyQuestionAnswer[]> {
    const { data, error } = await supabase
      .from('company_question_answers')
      .select(`
        id,
        answer,
        question_id,
        company_search_id,
        created_at,
        agent_questions (
          id,
          question
        )
      `)
      .eq('company_search_id', searchId);

    if (error) {
      console.error('Error fetching answers:', error);
      return [];
    }
    
    return (data || []) as CompanyQuestionAnswer[];
  }
};
