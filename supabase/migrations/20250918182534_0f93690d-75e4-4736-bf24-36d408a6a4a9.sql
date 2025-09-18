-- Phase 3: Drop webhook_settings table
-- This table is no longer needed as webhook URLs are now managed through secrets
-- and default_signup_credits is handled by the profiles table default value

DROP TABLE IF EXISTS webhook_settings;