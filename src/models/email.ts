/**
 * Email domain models
 */

export interface EmailSettings {
  id: string;
  user_id: string;
  email_address: string;
  app_password?: string;
  email_provider: string;
  smtp_host: string;
  smtp_port: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
  connection_type?: string | null;
  hubspot_bcc_address?: string | null;
}

export interface EmailSettingsInsert {
  user_id: string;
  email_address: string;
  email_provider: string;
  smtp_host: string;
  smtp_port: number;
  app_password?: string;
  is_active?: boolean;
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
  connection_type?: string | null;
  hubspot_bcc_address?: string | null;
}

export interface EmailSettingsUpdate {
  email_address?: string;
  email_provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  app_password?: string;
  is_active?: boolean;
  oauth2_client_id?: string | null;
  oauth2_client_secret?: string | null;
  oauth2_refresh_token?: string | null;
  connection_type?: string | null;
  hubspot_bcc_address?: string | null;
}

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface EmailAuthSettings {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
}
