
import { ContactInfo } from '@/types/company';

export type Answer = {
  question_id: string;
  answer: string;
};

export type ElevatorPitch = {
  company_name: string;
  tagline: string;
  introduction?: string;
  overview?: string;
  services: {
    name: string;
    description: string;
  }[];
  value_proposition?: string;
  client_value?: string;
  client_names?: string[];
  notable_clients?: string[];
  client_testimonials?: {
    client_name?: string;
    name?: string;
    title: string;
    company: string;
    feedback?: string;
    quote?: string;
  }[];
  call_to_action?: string;
};

export type WebhookParseResult = {
  processedResults: Answer[];
  contactInfo?: ContactInfo;
  elevatorPitch?: ElevatorPitch;
};

/**
 * Parses webhook response data according to the expected formats:
 * 1. [{ output: { basic_info: {...}, questions: [...] } }]
 * 2. [{ output: "{\"basic_info\":{...},\"answers\":[...]}" }]
 * 3. [{ output: { elevator_pitch: {...} } }]
 */
export const parseWebhookResponse = (responseData: any): WebhookParseResult => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  let elevatorPitch: ElevatorPitch | undefined = undefined;
  
  console.log('Parsing webhook response:', JSON.stringify(responseData));
  
  try {
    // Check if responseData is an array with output
    if (Array.isArray(responseData) && responseData.length > 0) {
      let output = responseData[0].output;
      
      // Check if output is a string (new format) and try to parse it
      if (typeof output === 'string') {
        try {
          console.log('Detected string output, attempting to parse JSON');
          output = JSON.parse(output);
        } catch (e) {
          console.error('Error parsing output string:', e);
        }
      }
      
      // Now handle output as an object
      if (output && typeof output === 'object') {
        // Extract elevator pitch if it exists
        if (output.elevator_pitch) {
          const ep = output.elevator_pitch;
          elevatorPitch = {
            company_name: ep.company_name,
            tagline: ep.tagline,
            // Handle both old and new schema fields
            introduction: ep.introduction || ep.overview,
            overview: ep.overview || ep.introduction,
            services: ep.services || [],
            value_proposition: ep.value_proposition || ep.client_value,
            client_value: ep.client_value || ep.value_proposition,
            client_names: ep.client_names || ep.notable_clients,
            notable_clients: ep.notable_clients || ep.client_names,
            client_testimonials: Array.isArray(ep.client_testimonials) 
              ? ep.client_testimonials.map(t => ({
                  client_name: t.client_name || t.name,
                  name: t.name || t.client_name,
                  title: t.title,
                  company: t.company,
                  feedback: t.feedback || t.quote,
                  quote: t.quote || t.feedback
                }))
              : Array.isArray(ep.client_feedback) 
                ? ep.client_feedback.map(t => ({
                    client_name: t.name,
                    name: t.name,
                    title: t.title,
                    company: t.company,
                    feedback: t.quote,
                    quote: t.quote
                  }))
                : [],
            call_to_action: ep.call_to_action
          };
          console.log('Extracted elevator pitch:', elevatorPitch);
        }
        
        // Extract contact info
        if (output.basic_info) {
          contactInfo = {
            www: output.basic_info.www || undefined,
            contact: output.basic_info.contact || undefined,
            email: output.basic_info.email || undefined,
            phone: output.basic_info.phone || undefined
          };
          console.log('Extracted contact info:', contactInfo);
        }
        
        // Extract questions and answers - handle both formats
        if (output.questions && Array.isArray(output.questions)) {
          // Old format with questions array
          processedResults = output.questions.map(q => ({
            question_id: q.id,
            answer: q.answer
          }));
        } else if (output.answers && Array.isArray(output.answers)) {
          // New format with answers array
          processedResults = output.answers.map(a => ({
            question_id: a.id,
            answer: a.answer
          }));
        }

        console.log('Processed results:', processedResults);
      }
    }
  } catch (error) {
    console.error('Error parsing webhook response:', error);
  }

  return { processedResults, contactInfo, elevatorPitch };
};
