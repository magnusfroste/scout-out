/**
 * Company Search Service - Business logic for storing company search results
 */

import { companyRepository } from '@/data/companyRepository';
import { ContactInfo, Answer, CompanySearchInsert, CompanyQuestionAnswerInsert } from '@/models/company';

// Re-export types for backward compatibility
export type { Answer, ContactInfo } from '@/models/company';
export type { CompanySearchRecord } from '@/models/company';

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
    
    // Build the search record
    const searchRecord: CompanySearchInsert = {
      user_id: userId,
      company_name: company,
      result: responseData,
      created_at: new Date().toISOString(),
      contact_info: contactInfo || null,
      www: contactInfo?.www || null,
      contact: contactInfo?.contact || null,
      email: contactInfo?.email || null,
      phone: contactInfo?.phone || null,
      role: contactInfo?.role || null
    };
    
    console.log('Inserting company search record:', JSON.stringify(searchRecord));
    const searchId = await companyRepository.create(searchRecord);
    
    if (!searchId) {
      console.error('No search record ID returned after insert');
      return false;
    }
    
    console.log('Company search stored with ID:', searchId);
    
    // Store individual answers if available
    if (processedResults && Array.isArray(processedResults) && processedResults.length > 0) {
      const now = new Date().toISOString();
      const answersToInsert: CompanyQuestionAnswerInsert[] = processedResults
        .filter(result => result.question_id && result.answer)
        .map(result => ({
          company_search_id: searchId,
          question_id: result.question_id,
          answer: result.answer,
          created_at: now,
          updated_at: now
        }));
      
      if (answersToInsert.length > 0) {
        console.log('Inserting answers:', JSON.stringify(answersToInsert));
        const success = await companyRepository.createAnswers(answersToInsert);
        
        if (success) {
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
