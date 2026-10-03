-- Run after the owner has registered and confirmed this email in Supabase Auth.
-- Intended owner supplied by the user. Never use user_metadata for authorization.
DO $$ BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  WHERE lower(email) = 'gulraizbutt297@gmail.com' AND email_confirmed_at IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Create and confirm the owner account gulraizbutt297@gmail.com first.'; END IF;
END $$;
-- Sign out and sign in again to refresh the role in the session token.
