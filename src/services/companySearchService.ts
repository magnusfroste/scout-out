
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from '@/hooks/useCompanySearch';

export type Answer = {
  question_id: string;
  answer: string;
};

export type CompanySearchRecord = {
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: ContactInfo;
  website?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
};

/**
 * Stores company search results in the database
 */
export const storeSearchResults = async (
  userId: string,
  company: string, 
  responseData: any, 
  processedResults: Answer[], 
  contactInfo?: ContactInfo
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Store the company search
    const searchRecord: CompanySearchRecord = {
      user_id: userId,
      company_name: company,
      result: responseData,
      created_at: new Date().toISOString()
    };
    
    // Add contact info if available
    if (contactInfo) {
      searchRecord.contact_info = contactInfo;
      searchRecord.website = contactInfo.www || null;
      searchRecord.contact_person = contactInfo.contact || null;
      searchRecord.email = contactInfo.email || null;
      searchRecord.phone = contactInfo.phone || null;
    }
    
    const { data: insertedRecord, error: searchError } = await supabase
      .from('company_searches')
      .insert(searchRecord)
      .select('id')
      .single();
    
    if (searchError) {
      console.error('Error storing company search:', searchError);
      throw searchError;
    }
    
    console.log('Company search stored with ID:', insertedRecord.id);
    
    // Store individual answers if available
    if (processedResults && Array.isArray(processedResults)) {
      const answersToInsert = processedResults
        .filter(result => result.question_id && result.answer) // Only valid results
        .map(result => ({
          company_search_id: insertedRecord.id,
          question_id: result.question_id,
          answer: result.answer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      
      if (answersToInsert.length > 0) {
        console.log('Inserting answers:', JSON.stringify(answersToInsert));
        
        const { error: answersError } = await supabase
          .from('company_question_answers')
          .insert(answersToInsert);
        
        if (answersError) {
          console.error('Error storing answers:', answersError);
          // Continue even if answer storage fails
        } else {
          console.log('Successfully stored answers for all questions');
        }
      } else {
        console.log('No valid answers found to store');
      }
    }
    
    return true;
  } catch (dbError) {
    console.error('Database error storing search results:', dbError);
    return false;
  }
};
