-- Fix RLS security issues
-- ---------------------------------------------------

-- 1. Enable RLS on app_integrations (was missing)
ALTER TABLE public.app_integrations ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on keep_alive (was missing)
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS policies for app_integrations (admin only)
CREATE POLICY "Admins can view app_integrations" ON public.app_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert app_integrations" ON public.app_integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update app_integrations" ON public.app_integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete app_integrations" ON public.app_integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. Add RLS policies for keep_alive (read-only, used for database keep-alive pings)
CREATE POLICY "Anyone can read keep_alive" ON public.keep_alive
  FOR SELECT USING (true);

-- Only service role can insert (for cron jobs)
-- No policy needed for insert as it will be blocked by RLS

-- 5. Fix api_searches - make it more restrictive (authenticated users only for insert)
DROP POLICY IF EXISTS "Anyone can insert api_searches" ON public.api_searches;

CREATE POLICY "Authenticated users can insert api_searches" ON public.api_searches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);