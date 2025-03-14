import { ContactInfo } from '@/types/company';

export type Answer = {
  question_id: string;
  answer: string;
};

export type ElevatorPitch = {
  company_name: string;
  tagline: string;
  about: string;
  services: {
    name: string;
    description: string;
  }[];
  value_proposition: string;
  clients: string[];
  testimonials: {
    name: string;
    position: string;
    company: string;
    testimonial: string;
  }[];
};

export type WebhookParseResult = {
  processedResults: Answer[];
  contactInfo?: ContactInfo;
  elevatorPitch?: ElevatorPitch;
};

/**
 * Main parser that delegates to the appropriate specific parser
 */
export const parseWebhookResponse = (responseData: any): WebhookParseResult => {
  console.log('Parsing webhook response:', JSON.stringify(responseData));
  
  try {
    // Check if responseData is valid
    if (!Array.isArray(responseData) || responseData.length === 0) {
      console.error('Invalid webhook response format (not an array or empty array)');
      return { processedResults: [] };
    }
    
    // Check if it's a value proposition response
    if (responseData[0].output && 
        (responseData[0].output.score !== undefined || 
         responseData[0].output.advice !== undefined || 
         responseData[0].output.introduction !== undefined)) {
      console.log('Detected value proposition response format');
      // This is a value proposition response, not meant for this parser
      return { processedResults: [] };
    }
    
    // For regular company search responses
    if (responseData[0].output) {
      const output = responseData[0].output;
      
      // Determine which parser to use based on the structure
      if (output.Company && output.Questions) {
        return parseCompanySearchResponse(responseData);
      } else if (output.about_us || output.our_services || output.clients) {
        return parseMyBusinessResponse(responseData);
      } else {
        // Try legacy format as fallback
        return parseLegacyCompanySearchResponse(responseData);
      }
    }
    
    // Default case if we couldn't determine the format
    console.error('Unknown webhook response format');
    return { processedResults: [] };
  } catch (error) {
    console.error('Error parsing webhook response:', error);
    return { processedResults: [] };
  }
};

/**
 * Parses webhook response data for company search feature
 * 
 * Format:
 * [{
 *   output: {
 *     Company: {
 *       www: string,
 *       contact: string,
 *       email: string,
 *       phone: string
 *     },
 *     Questions: [
 *       {
 *         id: string,
 *         answer: string
 *       }
 *     ]
 *   }
 * }]
 */
const parseCompanySearchResponse = (responseData: any): WebhookParseResult => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  
  try {
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
      const output = responseData[0].output;
      
      // Extract contact info
      if (output.Company) {
        contactInfo = {
          www: output.Company.www || undefined,
          contact: output.Company.contact || undefined,
          role: output.Company.role || undefined,
          email: output.Company.email || undefined,
          phone: output.Company.phone || undefined
        };
      }
      
      // Extract questions and answers
      if (Array.isArray(output.Questions)) {
        processedResults = output.Questions.map(q => ({
          question_id: q.id,
          answer: q.answer
        }));
      }
    }
  } catch (error) {
    console.error('Error parsing company search response:', error);
  }
  
  return { processedResults, contactInfo };
};

/**
 * Parses webhook response data for legacy company search format
 */
const parseLegacyCompanySearchResponse = (responseData: any): WebhookParseResult => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  
  try {
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
      const output = responseData[0].output;
      
      // Extract contact info from basic_info
      if (output.basic_info) {
        contactInfo = {
          www: output.basic_info.www || undefined,
          contact: output.basic_info.contact || undefined,
          email: output.basic_info.email || undefined,
          phone: output.basic_info.phone || undefined
        };
      }
      
      // Extract legacy format questions/answers
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
    }
  } catch (error) {
    console.error('Error parsing legacy company search response:', error);
  }
  
  return { processedResults, contactInfo };
};

/**
 * Parses webhook response data for My Business feature
 * 
 * Format:
 * [{
 *   output: {
 *     about_us: string,
 *     our_services: { [serviceName: string]: string },
 *     delivered_value: string,
 *     clients: string[],
 *     clients_testimonials: Array<{name, position, company, testimonial}>
 *   }
 * }]
 */
const parseMyBusinessResponse = (responseData: any): WebhookParseResult => {
  let elevatorPitch: ElevatorPitch | undefined = undefined;
  
  try {
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
      const output = responseData[0].output;
      
      // Get company name from output data or extract from URL
      const companyName = output.company_name || output.name || extractCompanyName();
      
      // Transform our_services from object to array of {name, description}
      const servicesArray = transformServicesObject(output.our_services || {});
      
      elevatorPitch = {
        company_name: companyName,
        tagline: extractTagline(output.about_us || ''),
        about: output.about_us || '',
        services: servicesArray,
        value_proposition: output.delivered_value || '',
        clients: Array.isArray(output.clients) ? output.clients : [],
        testimonials: Array.isArray(output.clients_testimonials) 
          ? output.clients_testimonials.map(t => ({
              name: t.name || '',
              position: t.position || '',
              company: t.company || '',
              testimonial: t.testimonial || ''
            }))
          : []
      };
      
      console.log('Extracted elevator pitch:', elevatorPitch);
    }
  } catch (error) {
    console.error('Error parsing my business response:', error);
  }
  
  return { processedResults: [], elevatorPitch };
};

/**
 * Helper function to transform services object to array
 */
const transformServicesObject = (servicesObject: Record<string, string>): Array<{name: string; description: string}> => {
  return Object.entries(servicesObject).map(([name, description]) => ({
    name,
    description
  }));
};

/**
 * Helper function to extract company name from website URL or use a default
 */
const extractCompanyName = (): string => {
  try {
    // Try to get the website URL from the application state
    const websiteUrl = window.location.href;
    console.log('Current URL for company name extraction:', websiteUrl);
    
    if (websiteUrl) {
      const url = new URL(websiteUrl);
      const hostname = url.hostname;
      console.log('Hostname extracted:', hostname);
      
      // Extract domain name without TLD
      const domainParts = hostname.split('.');
      console.log('Domain parts:', domainParts);
      
      if (domainParts.length >= 2) {
        // Use the second-to-last part (domain name without TLD)
        const name = domainParts[domainParts.length - 2];
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        console.log('Extracted company name from URL:', capitalizedName);
        return capitalizedName;
      }
    }
  } catch (e) {
    console.error('Error extracting company name:', e);
  }
  
  console.log('Using default company name: "Your Company"');
  return 'Your Company';
};

/**
 * Helper function to extract a tagline from the about text
 */
const extractTagline = (aboutText: string): string => {
  if (!aboutText) return 'Excellence in Business';
  
  // Try to extract first sentence if it's short enough
  const firstSentence = aboutText.split('.')[0];
  if (firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Otherwise, extract first 50 characters and find a good break point
  let shortTagline = aboutText.substring(0, 60);
  const lastSpaceIndex = shortTagline.lastIndexOf(' ');
  
  if (lastSpaceIndex > 30) {
    shortTagline = shortTagline.substring(0, lastSpaceIndex);
  }
  
  return shortTagline + '...';
};
