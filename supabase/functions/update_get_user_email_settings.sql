
-- Update the get_user_email_settings function to include OAuth2 fields
CREATE OR REPLACE FUNCTION public.get_user_email_settings()
 RETURNS SETOF user_email_settings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_email_settings
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$function$;
