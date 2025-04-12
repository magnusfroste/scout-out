
import { Json } from '@/integrations/supabase/types';

export interface ContactInfo {
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  contact?: string;
  www?: string;
}

export interface ElevatorPitch {
  industry?: string;
  products?: string[];
  size?: string;
  headquarters?: string;
  website?: string;
  founded?: string;
  summary?: string;
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
  subject: string;
}
