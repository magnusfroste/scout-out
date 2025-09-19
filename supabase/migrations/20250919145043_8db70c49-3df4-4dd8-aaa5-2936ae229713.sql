-- Add connection_type column to user_email_settings table
ALTER TABLE public.user_email_settings 
ADD COLUMN connection_type TEXT DEFAULT 'individual' CHECK (connection_type IN ('individual', 'shared'));