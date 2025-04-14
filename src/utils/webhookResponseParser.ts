
import { Answer as CompanyAnswer, ContactInfo } from '@/types/company';

export interface ElevatorPitch {
  industry?: string;
  products?: string[];
  size?: string;
  headquarters?: string;
  website?: string;
  founded?: string;
  summary?: string;
  company_name?: string;
  tagline?: string;
  about?: string;
  services?: Array<{
    name: string;
    description: string;
  }>;
  testimonials?: Array<{
    name: string;
    position: string;
    company?: string;
    testimonial: string;
  }>;
  clients?: string[];
  value_proposition?: string;
}

export interface Answer {
  question_id: string;
  answer: string;
}

export const parseContactInfo = (data: any): ContactInfo | undefined => {
  if (!data) return undefined;

  try {
    const contactInfo: ContactInfo = {};

    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        Object.assign(contactInfo, parsedData);
      } catch (e) {
        console.error("Failed to parse contact info string:", data, e);
        return undefined;
      }
    } else if (typeof data === 'object') {
      Object.assign(contactInfo, data);
    } else {
      console.error("Unexpected contact info format:", data);
      return undefined;
    }

    return contactInfo;
  } catch (error) {
    console.error("Error parsing contact info:", error, data);
    return undefined;
  }
};

export const parseElevatorPitch = (data: any): ElevatorPitch | undefined => {
  if (!data) return undefined;

  try {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as ElevatorPitch;
      } catch (e) {
        console.error("Failed to parse elevator pitch string:", data, e);
        return undefined;
      }
    } else if (typeof data === 'object') {
      return data as ElevatorPitch;
    } else {
      console.error("Unexpected elevator pitch format:", data);
      return undefined;
    }
  } catch (error) {
    console.error("Error parsing elevator pitch:", error, data);
    return undefined;
  }
};

export const parseResults = (data: any): Answer[] | undefined => {
  if (!data) return undefined;

  try {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as Answer[];
      } catch (e) {
        console.error("Failed to parse results string:", data, e);
        return undefined;
      }
    } else if (Array.isArray(data)) {
      return data.map(item => ({
        question_id: item.question_id || item.questionId || '',
        answer: item.answer || ''
      }));
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([question_id, answer]) => ({
        question_id,
        answer: String(answer)
      }));
    } else {
      console.error("Unexpected results format:", data);
      return undefined;
    }
  } catch (error) {
    console.error("Error parsing results:", error, data);
    return undefined;
  }
};

export interface WebhookResponse {
  results?: any;
  contact_info?: any;
  elevator_pitch?: any;
  company_name?: string;
  company_info?: any;
  contactInfo?: any;
  questions?: any;
  answers?: any;
  [key: string]: any;
}

export interface ParsedWebhookResponse {
  processedResults: Answer[] | undefined;
  contactInfo: ContactInfo | undefined;
  elevatorPitch: ElevatorPitch | undefined;
}

export const parseWebhookResponse = (response: WebhookResponse): ParsedWebhookResponse => {
  let processedResults: Answer[] | undefined;
  let contactInfo: ContactInfo | undefined;
  let elevatorPitch: ElevatorPitch | undefined;

  try {
    if (response.results) {
      processedResults = parseResults(response.results);
    } else if (response.answers) {
      processedResults = parseResults(response.answers);
    } else if (response.questions) {
      processedResults = parseResults(response.questions);
    }

    if (response.contact_info) {
      contactInfo = parseContactInfo(response.contact_info);
    } else if (response.contactInfo) {
      contactInfo = parseContactInfo(response.contactInfo);
    } else if (response.company_info) {
      contactInfo = parseContactInfo(response.company_info);
    }

    if (response.elevator_pitch) {
      elevatorPitch = parseElevatorPitch(response.elevator_pitch);
    }
  } catch (error) {
    console.error("Error parsing webhook response:", error, response);
  }

  return {
    processedResults,
    contactInfo,
    elevatorPitch
  };
};
