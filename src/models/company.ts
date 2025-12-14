/**
 * Company domain models
 */

export interface Question {
  id: string;
  question: string;
}

export interface Answer {
  question_id: string;
  answer: string;
}

export interface ContactInfo {
  www?: string;
  contact?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SearchResult {
  results?: Answer[];
  contact_info?: ContactInfo;
}

export interface CompanySearchRecord {
  id: string;
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: ContactInfo | any;
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
  updated_at?: string | null;
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

export interface CompanySearch {
  id: string;
  company_name: string;
  company_url?: string;
  company_domain?: string;
  created_at: string;
  user_id?: string;
  result?: any;
  subject?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
  answer_count?: number;
  www?: string;
  contact?: string;
  email?: string;
  phone?: string;
  role?: string;
  sent_email_at?: string;
}

// Insert/Update types for database operations
export interface CompanySearchInsert {
  user_id: string;
  company_name: string;
  result: any;
  created_at: string;
  contact_info?: ContactInfo | null;
  www?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  subject?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
}

export interface CompanySearchUpdate {
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
  subject?: string | null;
}

export interface CompanyQuestionAnswerInsert {
  company_search_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}
