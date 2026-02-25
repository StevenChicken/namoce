-- Migration 005: Update signup trigger to handle Google OAuth metadata
-- Google provides: given_name, family_name, full_name, name, avatar_url
-- Email+password signup provides: first_name, last_name, nickname, etc.
-- This trigger handles both cases.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role user_role;
  _status user_status;
  _meta jsonb;
  _first_name text;
  _last_name text;
  _full_name text;
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

  -- Extract first name: email+password uses first_name, Google uses given_name
  _first_name := COALESCE(
    _meta->>'first_name',       -- email+password signup
    _meta->>'given_name',       -- Google OAuth
    NULL
  );

  -- Extract last name: email+password uses last_name, Google uses family_name
  _last_name := COALESCE(
    _meta->>'last_name',        -- email+password signup
    _meta->>'family_name',      -- Google OAuth
    NULL
  );

  -- Fallback: split full_name or name if first/last still NULL
  IF _first_name IS NULL AND _last_name IS NULL THEN
    _full_name := COALESCE(_meta->>'full_name', _meta->>'name');
    IF _full_name IS NOT NULL AND _full_name != '' THEN
      _first_name := split_part(_full_name, ' ', 1);
      -- Everything after the first space becomes last_name
      IF position(' ' in _full_name) > 0 THEN
        _last_name := substring(_full_name from position(' ' in _full_name) + 1);
      END IF;
    END IF;
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
    _first_name,
    _last_name,
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
