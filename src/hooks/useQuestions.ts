
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Question = {
  id: string;
  question: string;
};

export const useQuestions = (userId: string | undefined) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (userId) {
      fetchQuestions();
    }
  }, [userId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
    }
  };

  return {
    questions,
    setQuestions,
    fetchQuestions
  };
};
