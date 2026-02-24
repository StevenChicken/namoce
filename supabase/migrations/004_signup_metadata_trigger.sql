-- Migration 004: Update signup trigger to read user metadata from auth.users
-- This ensures profile fields (first_name, last_name, etc.) are populated
-- at INSERT time via raw_user_meta_data, rather than relying on a separate
-- RLS-gated UPDATE after signup.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _status text;
  _meta jsonb;
BEGIN
  _meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  -- Auto-assign super_admin role for known admin emails
  IF NEW.email IN ('stefano.pollastri25@gmail.com', 'giu.pollastri@gmail.com') THEN
    _role := 'super_admin';
    _status := 'active';
  ELSE
    _role := 'volontario';
    _status := 'pending';
  END IF;

  INSERT INTO public.users (
    id,
    email,
    role,
    status,
    first_name,
    last_name,
    nickname,
    phone_encrypted,
    sectors_of_interest,
    notes,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    _role,
    _status,
    _meta->>'first_name',
    _meta->>'last_name',
    _meta->>'nickname',
    _meta->>'phone_encrypted',
    CASE
      WHEN _meta->'sectors_of_interest' IS NOT NULL
        AND jsonb_typeof(_meta->'sectors_of_interest') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(_meta->'sectors_of_interest'))
      ELSE NULL
    END,
    _meta->>'notes',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;
