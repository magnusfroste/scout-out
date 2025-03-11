
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
  email?: string;
  phone?: string;
};

export type BusinessData = {
  elevator_pitch?: any;
  contact_info?: ContactInfo;
};

export type SearchResultType = {
  results?: Answer[];
  contact_info?: ContactInfo;
};
