
-- Add OAuth2 fields to user_email_settings table
ALTER TABLE user_email_settings
ADD COLUMN IF NOT EXISTS oauth2_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth2_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth2_refresh_token TEXT;

-- Make app_password nullable since we might use OAuth2 instead
ALTER TABLE user_email_settings
ALTER COLUMN app_password DROP NOT NULL;
