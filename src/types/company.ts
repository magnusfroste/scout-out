
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
};

export type SearchResultType = {
  results?: Answer[];
  contact_info?: ContactInfo;
};

export interface CompanySearchRecord {
  id: string;
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: any;
  www?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
  subject?: string | null;
  sent_email_at?: string | null;
  [key: string]: any; 
}

export interface CompanyQuestionAnswer {
  id: string;
  answer: string | null;
  question_id: string;
  company_search_id: string;
  created_at: string;
  agent_questions: {
    id: string;
    question: string;
  };
}
