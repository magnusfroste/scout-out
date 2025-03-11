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
 * Parses webhook response data for My Business feature in the standard format:
 * [{
 *   output: {
 *     about_us: string,
 *     our_services: { [serviceName: string]: string }, // Object with service names as keys
 *     delivered_value: string,
 *     clients: string[],
 *     clients_testimonials: Array<{name, position, company, testimonial}>
 *   }
 * }]
 */
export const parseWebhookResponse = (responseData: any): WebhookParseResult => {
  let processedResults: Answer[] = [];
  let contactInfo: ContactInfo | undefined = undefined;
  let elevatorPitch: ElevatorPitch | undefined = undefined;
  
  console.log('Parsing webhook response:', JSON.stringify(responseData));
  
  try {
    // Check if responseData is an array with output
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
      const output = responseData[0].output;
      
      // Extract my business data if available
      if (output.about_us || output.our_services || output.clients) {
        // Get the company name from the URL or use a default
        const companyName = extractCompanyName();
        
        // Transform our_services from object to array of {name, description}
        const servicesArray = transformServicesObject(output.our_services || {});
        
        elevatorPitch = {
          company_name: companyName,
          tagline: extractTagline(output.about_us || ''),
          about: output.about_us || '',
          services: servicesArray,
          value_proposition: output.delivered_value || '',
          clients: output.clients || [],
          testimonials: (output.clients_testimonials || []).map(t => ({
            name: t.name,
            position: t.position,
            company: t.company,
            testimonial: t.testimonial
          }))
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
      }
      
      // Extract processed results (for company search feature)
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
    console.error('Error parsing webhook response:', error);
  }

  return { processedResults, contactInfo, elevatorPitch };
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
    if (websiteUrl) {
      const url = new URL(websiteUrl);
      const hostname = url.hostname;
      
      // Extract domain name without TLD
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        // Use the second-to-last part (domain name without TLD)
        const name = domainParts[domainParts.length - 2];
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  } catch (e) {
    console.error('Error extracting company name:', e);
  }
  
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
