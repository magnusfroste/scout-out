
import { ElevatorPitch } from '@/utils/webhookResponseParser';
import { ContactInfo } from '@/types/company';

export interface UserProfile {
  id: string;
  credits: number;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  website_url?: string | null;
  business_data?: {
    elevator_pitch?: ElevatorPitch;
    contact_info?: ContactInfo;
  } | null;
}
