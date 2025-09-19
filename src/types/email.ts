
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
}
