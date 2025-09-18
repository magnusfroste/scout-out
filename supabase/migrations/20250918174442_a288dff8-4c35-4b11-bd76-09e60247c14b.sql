-- Fix Critical Security Issues: Enable RLS on all public tables (corrected)

-- Enable RLS on all public schema tables to fix security vulnerabilities
-- Note: This will only enable RLS if it's not already enabled
DO $$
BEGIN
  -- Enable RLS on tables that don't already have it enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'webhook_settings' AND rowsecurity = true) THEN
    ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_email_settings' AND rowsecurity = true) THEN
    ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_searches' AND rowsecurity = true) THEN
    ALTER TABLE public.company_searches ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'prompts' AND rowsecurity = true) THEN
    ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'company_question_answers' AND rowsecurity = true) THEN
    ALTER TABLE public.company_question_answers ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'webhook_testing' AND rowsecurity = true) THEN
    ALTER TABLE public.webhook_testing ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'prompt_evaluations' AND rowsecurity = true) THEN
    ALTER TABLE public.prompt_evaluations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'credit_transactions' AND rowsecurity = true) THEN
    ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agent_questions' AND rowsecurity = true) THEN
    ALTER TABLE public.agent_questions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'api_searches' AND rowsecurity = true) THEN
    ALTER TABLE public.api_searches ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_sessions' AND rowsecurity = true) THEN
    ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Fix function security by setting proper search_path on database functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', null);
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_email_settings()
RETURNS SETOF user_email_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_email_settings
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$function$;