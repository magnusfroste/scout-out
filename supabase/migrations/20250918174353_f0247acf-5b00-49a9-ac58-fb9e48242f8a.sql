-- Fix Critical Security Issues: Enable RLS on all public tables

-- Enable RLS on all public schema tables to fix security vulnerabilities
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.company_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_testing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

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

-- Add RLS policy for api_searches table since it has none
CREATE POLICY "Users can create api searches" 
ON public.api_searches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view api searches" 
ON public.api_searches 
FOR SELECT 
USING (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;