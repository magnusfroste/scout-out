-- Add is_demo column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

-- Create function to reset demo user credits daily
CREATE OR REPLACE FUNCTION public.reset_demo_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = 10, updated_at = now()
  WHERE is_demo = true;
END;
$$;

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;