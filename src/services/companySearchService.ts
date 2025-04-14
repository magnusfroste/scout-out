import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from '@/types/company';

export type Answer = {
  question_id: string;
  answer: string;
};

export type CompanySearchRecord = {
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: ContactInfo | null;
  www?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  subject?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
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
  if (!userId) {
    console.error('Cannot store search results: Missing user ID');
    return false;
  }
  
  try {
    console.log(`Storing search results for user ${userId} and company ${company}`);
    
    // Store the company search
    const searchRecord: CompanySearchRecord = {
      user_id: userId,
      company_name: company,
      result: responseData,
      created_at: new Date().toISOString()
    };
    
    // Add contact info if available
    if (contactInfo) {
      // Store the full contact info in the JSON field for backward compatibility
      searchRecord.contact_info = contactInfo;
      
      // Store individual fields in their respective columns
      searchRecord.www = contactInfo.www || null;
      searchRecord.contact = contactInfo.contact || null;
      searchRecord.email = contactInfo.email || null;
      searchRecord.phone = contactInfo.phone || null;
      searchRecord.role = contactInfo.role || null;
    }
    
    console.log('Inserting company search record:', JSON.stringify(searchRecord));
    const { data: insertedRecord, error: searchError } = await supabase
      .from('company_searches')
      .insert(searchRecord)
      .select('id')
      .single();
    
    if (searchError) {
      console.error('Error storing company search:', searchError.message, searchError.details);
      return false;
    }
    
    if (!insertedRecord || !insertedRecord.id) {
      console.error('No search record ID returned after insert');
      return false;
    }
    
    console.log('Company search stored with ID:', insertedRecord.id);
    
    // Store individual answers if available
    if (processedResults && Array.isArray(processedResults) && processedResults.length > 0) {
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
          console.error('Error storing answers:', answersError.message, answersError.details);
          // Continue even if answer storage fails
        } else {
          console.log('Successfully stored answers for all questions');
        }
      } else {
        console.log('No valid answers to insert');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error storing search results:', error);
    return false;
  }
};
