
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_email_settings';

-- Enable RLS if not already enabled
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can insert their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can update their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can delete their own email settings" ON user_email_settings;

-- Create new policies
CREATE POLICY "Users can view their own email settings"
  ON user_email_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email settings"
  ON user_email_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email settings"
  ON user_email_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email settings"
  ON user_email_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_email_settings TO authenticated;

-- Check policies after creation
SELECT * FROM pg_policies WHERE tablename = 'user_email_settings';
