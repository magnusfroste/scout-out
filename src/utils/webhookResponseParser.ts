
import { ContactInfo } from '@/types/company';

export type Answer = {
  question_id: string;
  answer: string;
};

/**
 * Parses webhook response data according to the expected format
 * [{ output: { basic_info: {...}, questions: [...] } }]
 */
export const parseWebhookResponse = (responseData: any): { 
  processedResults: Answer[];
  contactInfo?: ContactInfo;
} => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  
  // Handle the format: [{ output: { basic_info: {...}, questions: [...] } }]
  if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
    const output = responseData[0].output;
    
    // Extract contact info
    if (output.basic_info) {
      contactInfo = {
        www: output.basic_info.www || undefined,
        contact: output.basic_info.contact || undefined,
        email: output.basic_info.email || undefined,
        phone: output.basic_info.phone || undefined
      };
    }
    
    // Extract questions and answers
    if (output.questions && Array.isArray(output.questions)) {
      processedResults = output.questions.map(q => ({
        question_id: q.id,
        answer: q.answer
      }));
    }
  }

  return { processedResults, contactInfo };
};
