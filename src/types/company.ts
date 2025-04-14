
import { Json } from '@/integrations/supabase/types';

export interface ContactInfo {
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  contact?: string;
  www?: string;
  address?: string;
}

export interface ElevatorPitch {
  industry?: string;
  products?: string[];
  size?: string;
  headquarters?: string;
  website?: string;
  founded?: string;
  summary?: string;
  // Adding missing properties
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

export interface CompanySearch {
  id: string;
  user_id: string;
  company_name: string;
  created_at: string;
  result: Json;
  contact_info: Json;
  contact: string;
  email: string;
  phone: string;
  role: string;
  www: string;
  score: number;
  advice: string;
  introduction: string;
  subject?: string;  // Make this optional since it might not exist in older database records
}

export interface Question {
  id: string;
  question: string;
}

export interface Answer {
  question_id: string;
  answer: string;
}

export interface SearchResultType {
  results: Answer[];
  contact_info?: ContactInfo;
}
