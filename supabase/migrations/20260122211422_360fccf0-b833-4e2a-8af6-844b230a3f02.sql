-- Create app_settings table for global feature flags
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" 
ON public.app_settings 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Insert initial settings (email and composio disabled by default)
INSERT INTO public.app_settings (key, value) VALUES 
  ('email_module_enabled', 'false'),
  ('composio_mcp_enabled', 'false');