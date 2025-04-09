-- Create user_email_settings table
CREATE TABLE IF NOT EXISTS user_email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email_provider TEXT NOT NULL,
  email_address TEXT NOT NULL,
  app_password TEXT NOT NULL,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_email_settings
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own email settings
CREATE POLICY "Users can view their own email settings"
  ON user_email_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own email settings
CREATE POLICY "Users can insert their own email settings"
  ON user_email_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own email settings
CREATE POLICY "Users can update their own email settings"
  ON user_email_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own email settings
CREATE POLICY "Users can delete their own email settings"
  ON user_email_settings
  FOR DELETE
  USING (auth.uid() = user_id);
