
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
  about_us?: string;
  services: {
    name: string;
    description: string;
  }[];
  value_proposition?: string;
  value_clients_experience?: string;
  client_value?: string;
  client_names?: string[];
  clients?: string[];
  notable_clients?: string[];
  client_testimonials?: {
    client_name?: string;
    name?: string;
    position?: string;
    title?: string;
    company?: string;
    testimonial?: string;
    feedback?: string;
    quote?: string;
  }[];
  client_feedback?: {
    client_name?: string;
    name?: string;
    position?: string;
    title?: string;
    company?: string;
    testimonial?: string;
    feedback?: string;
    quote?: string;
  }[];
  call_to_action?: string;
};

// This is the structure we expect from the LLM when using structured output
export type StructuredElevatorPitch = {
  company_name: string;
  tagline: string;
  about_us: string;
  services: Array<{
    name: string;
    description: string;
  }>;
  value_clients_experience: string;
  clients: string[];
  client_testimonials: Array<{
    name: string;
    position: string;
    company: string;
    quote: string;
  }>;
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
 * 4. Direct N8N output format without wrapper
 * 5. Structured JSON output from LLM using the StructuredElevatorPitch format
 */
export const parseWebhookResponse = (responseData: any): WebhookParseResult => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  let elevatorPitch: ElevatorPitch | undefined = undefined;
  
  console.log('Parsing webhook response:', JSON.stringify(responseData));
  
  try {
    // First, try to identify the structure we're dealing with
    let output = responseData;
    
    // Handle N8N wrapped format: Array with output field
    if (Array.isArray(responseData) && responseData.length > 0) {
      output = responseData[0].output;
    } 
    // Handle direct output object format
    else if (responseData && typeof responseData === 'object' && 'output' in responseData) {
      output = responseData.output;
    }
    
    // Handle N8N string output that needs to be parsed
    if (typeof output === 'string') {
      try {
        console.log('Detected string output, attempting to parse JSON');
        output = JSON.parse(output);
      } catch (e) {
        console.error('Error parsing output string:', e);
      }
    }
    
    // Now handle output as an object with different possible structures
    if (output && typeof output === 'object') {
      // Check if this is the structured LLM output format
      if (isStructuredElevatorPitch(output)) {
        console.log('Detected structured elevator pitch format');
        extractStructuredElevatorPitch(output);
      }
      // Extract elevator pitch format
      else if (output.elevator_pitch) {
        extractElevatorPitch(output.elevator_pitch);
      } 
      // Direct elevator pitch data without wrapper
      else if (output.company_name && (output.tagline || output.services)) {
        extractElevatorPitch(output);
      }
      
      // Extract contact info
      if (output.basic_info) {
        extractContactInfo(output.basic_info);
      } else if (output.contact_info) {
        extractContactInfo(output.contact_info);
      } else if (output.www || output.email || output.phone || output.contact) {
        // Direct contact information
        extractContactInfo(output);
      }
      
      // Extract questions/answers
      if (output.questions && Array.isArray(output.questions)) {
        processedResults = output.questions.map(q => ({
          question_id: q.id,
          answer: q.answer
        }));
      } else if (output.answers && Array.isArray(output.answers)) {
        processedResults = output.answers.map(a => ({
          question_id: a.id,
          answer: a.answer
        }));
      }

      console.log('Processed results:', processedResults);
    }
    
    // Helper function to check if the output matches our structured format
    function isStructuredElevatorPitch(data: any): boolean {
      return (
        data.company_name &&
        data.tagline &&
        data.about_us &&
        Array.isArray(data.services) &&
        data.value_clients_experience !== undefined &&
        Array.isArray(data.clients) &&
        Array.isArray(data.client_testimonials)
      );
    }
    
    // Helper function to extract structured elevator pitch data
    function extractStructuredElevatorPitch(data: StructuredElevatorPitch) {
      elevatorPitch = {
        company_name: data.company_name,
        tagline: data.tagline,
        about_us: data.about_us,
        introduction: data.about_us, // For compatibility with existing code
        overview: data.about_us,     // For compatibility with existing code
        services: data.services,
        value_clients_experience: data.value_clients_experience,
        value_proposition: data.value_clients_experience, // For compatibility
        client_value: data.value_clients_experience,      // For compatibility
        clients: data.clients,
        client_names: data.clients,      // For compatibility
        notable_clients: data.clients,   // For compatibility
        client_testimonials: data.client_testimonials.map(t => ({
          name: t.name,
          client_name: t.name,  // For compatibility
          position: t.position,
          title: t.position,    // For compatibility
          company: t.company,
          quote: t.quote,
          testimonial: t.quote, // For compatibility
          feedback: t.quote     // For compatibility
        })),
        client_feedback: data.client_testimonials.map(t => ({
          name: t.name,
          client_name: t.name,
          position: t.position,
          title: t.position,
          company: t.company,
          quote: t.quote,
          testimonial: t.quote,
          feedback: t.quote
        })),
        call_to_action: data.call_to_action || ''
      };
      console.log('Extracted structured elevator pitch:', elevatorPitch);
    }
    
    // Helper function to extract and normalize elevator pitch data
    function extractElevatorPitch(ep: any) {
      elevatorPitch = {
        company_name: ep.company_name,
        tagline: ep.tagline || '',
        // Handle different naming conventions for the same conceptual fields
        introduction: ep.introduction || ep.overview || ep.about_us || '',
        overview: ep.overview || ep.introduction || ep.about_us || '',
        about_us: ep.about_us || ep.overview || ep.introduction || '',
        services: Array.isArray(ep.services) ? ep.services : [],
        value_proposition: ep.value_proposition || ep.client_value || ep.value_clients_experience || '',
        value_clients_experience: ep.value_clients_experience || ep.value_proposition || ep.client_value || '',
        client_value: ep.client_value || ep.value_proposition || ep.value_clients_experience || '',
        client_names: ep.client_names || ep.notable_clients || ep.clients || [],
        clients: ep.clients || ep.client_names || ep.notable_clients || [],
        notable_clients: ep.notable_clients || ep.client_names || ep.clients || [],
        client_testimonials: normalizeTestimonials(ep.client_testimonials || ep.client_feedback || []),
        client_feedback: normalizeTestimonials(ep.client_feedback || ep.client_testimonials || []),
        call_to_action: ep.call_to_action || ''
      };
      console.log('Extracted elevator pitch:', elevatorPitch);
    }
    
    // Helper function to normalize testimonial data
    function normalizeTestimonials(testimonials: any[]): any[] {
      if (!Array.isArray(testimonials)) return [];
      
      return testimonials.map(t => ({
        client_name: t.client_name || t.name || '',
        name: t.name || t.client_name || '',
        title: t.title || t.position || '',
        position: t.position || t.title || '',
        company: t.company || '',
        feedback: t.feedback || t.quote || t.testimonial || '',
        quote: t.quote || t.feedback || t.testimonial || '',
        testimonial: t.testimonial || t.feedback || t.quote || ''
      }));
    }
    
    // Helper function to extract and normalize contact info
    function extractContactInfo(info: any) {
      contactInfo = {
        www: info.www || info.website || undefined,
        contact: info.contact || undefined,
        email: info.email || undefined,
        phone: info.phone || undefined
      };
      console.log('Extracted contact info:', contactInfo);
    }
    
  } catch (error) {
    console.error('Error parsing webhook response:', error);
  }

  return { processedResults, contactInfo, elevatorPitch };
};
