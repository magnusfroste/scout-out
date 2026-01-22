-- =====================================================
-- MIGRATION: Create full database schema from external Supabase
-- =====================================================

-- 1. Helper functions
-- ---------------------------------------------------

-- Uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Hantera nya användare (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', null);
  RETURN new;
END;
$$;

-- 2. Core Tables
-- ---------------------------------------------------

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 5,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  website_url TEXT,
  business_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- agent_questions
CREATE TABLE public.agent_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- company_searches
CREATE TABLE public.company_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  www TEXT,
  result JSONB,
  contact TEXT,
  contact_info JSONB,
  email TEXT,
  phone TEXT,
  role TEXT,
  subject TEXT,
  introduction TEXT,
  advice TEXT,
  score INTEGER,
  sent_email_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at DATE
);

-- company_question_answers
CREATE TABLE public.company_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_search_id UUID NOT NULL REFERENCES public.company_searches(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.agent_questions(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- credit_transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_email_settings
CREATE TABLE public.user_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  email_provider TEXT NOT NULL,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  app_password TEXT,
  oauth2_client_id TEXT,
  oauth2_client_secret TEXT,
  oauth2_refresh_token TEXT,
  connection_type TEXT DEFAULT 'individual',
  hubspot_bcc_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- oauth_connections
CREATE TABLE public.oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  connection_type TEXT NOT NULL DEFAULT 'composio',
  auth_config_id TEXT,
  mcp_server_id TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- api_searches
CREATE TABLE public.api_searches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- app_integrations
CREATE TABLE public.app_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- app_settings (for feature flags)
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- webhook_testing
CREATE TABLE public.webhook_testing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- prompt_evaluations
CREATE TABLE public.prompt_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_prompt TEXT NOT NULL,
  master_prompt TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  evaluation_results JSONB,
  company_name TEXT,
  industry TEXT,
  company_size TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- keep_alive
CREATE TABLE public.keep_alive (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Lab Tables (Advanced Research)
-- ---------------------------------------------------

-- lab_company_profiles
CREATE TABLE public.lab_company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  linkedin_url TEXT,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  mission TEXT NOT NULL,
  vision TEXT,
  values TEXT[] NOT NULL DEFAULT '{}',
  main_offerings TEXT[] NOT NULL DEFAULT '{}',
  offering_type TEXT[] NOT NULL DEFAULT '{}',
  target_industries TEXT[] NOT NULL DEFAULT '{}',
  ideal_client_size TEXT[] NOT NULL DEFAULT '{}',
  geographic_markets TEXT[] NOT NULL DEFAULT '{}',
  unique_differentiators TEXT[] NOT NULL DEFAULT '{}',
  typical_results TEXT[] NOT NULL DEFAULT '{}',
  credentials TEXT[] NOT NULL DEFAULT '{}',
  delivery_model TEXT[] NOT NULL DEFAULT '{}',
  project_scope TEXT NOT NULL,
  pricing_positioning TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  organizational_personality TEXT[] NOT NULL DEFAULT '{}',
  known_clients BOOLEAN DEFAULT false,
  known_clients_list TEXT,
  success_story TEXT,
  years_active TEXT,
  business_registration TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lab_user_profiles
CREATE TABLE public.lab_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  linkedin_profile TEXT,
  date_of_birth DATE,
  birthplace TEXT,
  current_location TEXT,
  role_in_organization TEXT NOT NULL,
  outreach_experience TEXT NOT NULL,
  prospects_per_week TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  introduction_style TEXT NOT NULL,
  expertise_positioning TEXT NOT NULL,
  credibility_preference TEXT[] NOT NULL DEFAULT '{}',
  preferred_contact_channel TEXT[] NOT NULL DEFAULT '{}',
  followup_timing TEXT NOT NULL,
  nonresponse_handling TEXT NOT NULL,
  pain_points_focus TEXT[] NOT NULL DEFAULT '{}',
  objection_handling TEXT[] NOT NULL DEFAULT '{}',
  meeting_format TEXT[] NOT NULL DEFAULT '{}',
  meeting_duration TEXT NOT NULL,
  success_metrics TEXT[] NOT NULL DEFAULT '{}',
  credits INTEGER NOT NULL DEFAULT 5,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lab_prospect_research
CREATE TABLE public.lab_prospect_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile_id UUID NOT NULL REFERENCES public.lab_company_profiles(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES public.lab_user_profiles(id) ON DELETE CASCADE,
  prospect_company_name TEXT NOT NULL,
  prospect_website_url TEXT NOT NULL,
  prospect_linkedin_url TEXT,
  webhook_url TEXT NOT NULL,
  research_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  research_results JSONB,
  fit_score INTEGER,
  decision_makers JSONB,
  contact_strategy JSONB,
  value_proposition JSONB,
  error_message TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_starred BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lab_research_templates
CREATE TABLE public.lab_research_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  master_prompt TEXT NOT NULL,
  research_type TEXT NOT NULL DEFAULT 'custom',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lab_credit_transactions
CREATE TABLE public.lab_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  research_id UUID REFERENCES public.lab_prospect_research(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Triggers
-- ---------------------------------------------------

-- Profile creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_questions_updated_at
  BEFORE UPDATE ON public.agent_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_question_answers_updated_at
  BEFORE UPDATE ON public.company_question_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_email_settings_updated_at
  BEFORE UPDATE ON public.user_email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at
  BEFORE UPDATE ON public.oauth_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_integrations_updated_at
  BEFORE UPDATE ON public.app_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_testing_updated_at
  BEFORE UPDATE ON public.webhook_testing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_evaluations_updated_at
  BEFORE UPDATE ON public.prompt_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_company_profiles_updated_at
  BEFORE UPDATE ON public.lab_company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_user_profiles_updated_at
  BEFORE UPDATE ON public.lab_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_prospect_research_updated_at
  BEFORE UPDATE ON public.lab_prospect_research
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_research_templates_updated_at
  BEFORE UPDATE ON public.lab_research_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Enable RLS on all tables
-- ---------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_testing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_prospect_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_research_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- ---------------------------------------------------

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- agent_questions
CREATE POLICY "Users can view own questions" ON public.agent_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions" ON public.agent_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON public.agent_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON public.agent_questions
  FOR DELETE USING (auth.uid() = user_id);

-- company_searches
CREATE POLICY "Users can view own searches" ON public.company_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches" ON public.company_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own searches" ON public.company_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches" ON public.company_searches
  FOR DELETE USING (auth.uid() = user_id);

-- company_question_answers (access via company_searches ownership)
CREATE POLICY "Users can view answers for own searches" ON public.company_question_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_searches cs
      WHERE cs.id = company_search_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for own searches" ON public.company_question_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_searches cs
      WHERE cs.id = company_search_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for own searches" ON public.company_question_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_searches cs
      WHERE cs.id = company_search_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete answers for own searches" ON public.company_question_answers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.company_searches cs
      WHERE cs.id = company_search_id AND cs.user_id = auth.uid()
    )
  );

-- credit_transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_email_settings
CREATE POLICY "Users can view own email settings" ON public.user_email_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email settings" ON public.user_email_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email settings" ON public.user_email_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email settings" ON public.user_email_settings
  FOR DELETE USING (auth.uid() = user_id);

-- oauth_connections
CREATE POLICY "Users can view own oauth connections" ON public.oauth_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oauth connections" ON public.oauth_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oauth connections" ON public.oauth_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own oauth connections" ON public.oauth_connections
  FOR DELETE USING (auth.uid() = user_id);

-- api_searches (public read/insert for logging)
CREATE POLICY "Anyone can read api_searches" ON public.api_searches
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert api_searches" ON public.api_searches
  FOR INSERT WITH CHECK (true);

-- app_settings (public read, admin update)
CREATE POLICY "Anyone can read app_settings" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update app_settings" ON public.app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert app_settings" ON public.app_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- webhook_testing (public read only)
CREATE POLICY "Anyone can read webhook_testing" ON public.webhook_testing
  FOR SELECT USING (true);

-- prompt_evaluations
CREATE POLICY "Users can view own evaluations" ON public.prompt_evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON public.prompt_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations" ON public.prompt_evaluations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evaluations" ON public.prompt_evaluations
  FOR DELETE USING (auth.uid() = user_id);

-- lab_company_profiles (demo mode - public access for now)
CREATE POLICY "Users can view own lab company profiles" ON public.lab_company_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab company profiles" ON public.lab_company_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab company profiles" ON public.lab_company_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab company profiles" ON public.lab_company_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- lab_user_profiles
CREATE POLICY "Users can view own lab user profiles" ON public.lab_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab user profiles" ON public.lab_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab user profiles" ON public.lab_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab user profiles" ON public.lab_user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- lab_prospect_research
CREATE POLICY "Users can view own lab research" ON public.lab_prospect_research
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab research" ON public.lab_prospect_research
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab research" ON public.lab_prospect_research
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab research" ON public.lab_prospect_research
  FOR DELETE USING (auth.uid() = user_id);

-- lab_research_templates
CREATE POLICY "Users can view own lab templates" ON public.lab_research_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab templates" ON public.lab_research_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab templates" ON public.lab_research_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab templates" ON public.lab_research_templates
  FOR DELETE USING (auth.uid() = user_id);

-- lab_credit_transactions
CREATE POLICY "Users can view own lab transactions" ON public.lab_credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab transactions" ON public.lab_credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Database function for email settings
-- ---------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_email_settings()
RETURNS SETOF user_email_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_email_settings
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$$;

-- 8. Insert initial app_settings for feature flags
-- ---------------------------------------------------

INSERT INTO public.app_settings (key, value) VALUES 
  ('email_module_enabled', 'false'),
  ('composio_mcp_enabled', 'false');