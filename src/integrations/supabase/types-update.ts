
/**
 * This is a partial update for the Supabase types.ts file.
 * Add these fields to the user_email_settings Row, Insert, and Update types
 */

// TypeScript interface showing what should be added to user_email_settings types
export interface UserEmailSettingsOAuth2Fields {
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
}

// Instructions for manual update:
// 1. Open src/integrations/supabase/types.ts
// 2. Find the user_email_settings Row, Insert, and Update types
// 3. Add the oauth2 fields to each type:
//    - oauth2_client_id?: string | null;
//    - oauth2_client_secret?: string | null;
//    - oauth2_refresh_token?: string | null;
