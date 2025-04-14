
export interface CompanySearch {
  id: string;
  company_name: string;
  company_url?: string;
  company_domain?: string;
  created_at: string;
  user_id?: string;
  result?: any;
  subject?: string;
}

export interface SearchResult {
  results: Array<{
    question_id: string;
    answer: string;
  }>;
  contact_info?: {
    www?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
}
