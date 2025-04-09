-- Create a function to get user email settings
CREATE OR REPLACE FUNCTION get_user_email_settings()
RETURNS SETOF user_email_settings
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_email_settings
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$$;
