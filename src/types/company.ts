
export type Question = {
  id: string;
  question: string;
};

export type Answer = {
  question_id: string;
  answer: string;
};

export type ContactInfo = {
  www?: string;
  contact?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string; // Add company_name to ContactInfo
};

export type CompanySearch = {
  id: string;
  company_name: string;
  contact?: string;
  contact_info?: any;
  created_at: string;
  email?: string;
  phone?: string;
  www?: string;
  role?: string;
  result?: any;
  score?: number;
  advice?: string;
  introduction?: string;
  subject?: string; // Add subject property
  user_id: string;
};

export type SearchResultType = {
  results?: Answer[];
  contact_info?: ContactInfo;
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
