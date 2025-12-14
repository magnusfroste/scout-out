/**
 * Profile domain models
 */

import { ElevatorPitch } from '@/utils/webhookResponseParser';
import { ContactInfo } from './company';

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

export interface ProfileInsert {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
  website_url?: string | null;
  business_data?: any | null;
}

export interface ProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  website_url?: string | null;
  business_data?: any | null;
  credits?: number;
}
