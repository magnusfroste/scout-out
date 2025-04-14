
import { supabase } from '@/integrations/supabase/client';

/**
 * Saves value proposition data to the database
 */
export const saveValuePropositionData = async (
  searchId: string,
  score: number | null,
  advice: string | null,
  introduction: string | null,
  subject: string | null
): Promise<boolean> => {
  try {
    console.log('Saving value proposition data for search:', searchId);
    console.log('Data to save:', { score, advice, introduction, subject });
    
    const { error } = await supabase
      .from('company_searches')
      .update({
        score,
        advice,
        introduction,
        subject,
        updated_at: new Date().toISOString()
      })
      .eq('id', searchId);
      
    if (error) {
      console.error('Error saving value proposition data:', error);
      return false;
    }
    
    console.log('Value proposition data saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveValuePropositionData:', error);
    return false;
  }
};
