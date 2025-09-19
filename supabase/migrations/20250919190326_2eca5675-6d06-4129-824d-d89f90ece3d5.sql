-- Create oauth_connections table for tracking Composio connections
CREATE TABLE public.oauth_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  auth_config_id TEXT,
  mcp_server_id TEXT,
  connection_type TEXT NOT NULL DEFAULT 'composio',
  status TEXT NOT NULL DEFAULT 'pending',
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for oauth_connections
CREATE POLICY "Users can view their own oauth connections" 
ON public.oauth_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oauth connections" 
ON public.oauth_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth connections" 
ON public.oauth_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth connections" 
ON public.oauth_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_oauth_connections_updated_at
BEFORE UPDATE ON public.oauth_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();