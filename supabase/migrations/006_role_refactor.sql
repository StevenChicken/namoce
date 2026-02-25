-- 006_role_refactor.sql
-- New role model: userType (utente/volontario) + adminLevel (none/admin/super_admin)
-- Removes approval flow, renames nickname → clown_name, drops sectors_of_interest

-- 1. Create new enum types
CREATE TYPE user_type AS ENUM ('utente', 'volontario');
CREATE TYPE admin_level AS ENUM ('none', 'admin', 'super_admin');

-- 2. Add new columns to users
ALTER TABLE public.users ADD COLUMN user_type user_type NOT NULL DEFAULT 'utente';
ALTER TABLE public.users ADD COLUMN admin_level admin_level NOT NULL DEFAULT 'none';

-- 3. Migrate existing data
UPDATE public.users SET admin_level = 'super_admin' WHERE role = 'super_admin';
UPDATE public.users SET admin_level = 'none' WHERE role = 'volontario';
-- All users start as 'utente' (the default), super admin promotes manually

-- 4. Rename nickname to clown_name
ALTER TABLE public.users RENAME COLUMN nickname TO clown_name;

-- 5. Change default status from 'pending' to 'active'
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'active';

-- 6. Drop sectors_of_interest
ALTER TABLE public.users DROP COLUMN IF EXISTS sectors_of_interest;

-- 7. Create admin_category_permissions table
CREATE TABLE public.admin_category_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  assigned_by uuid REFERENCES public.users(id),
  assigned_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category)
);
ALTER TABLE public.admin_category_permissions ENABLE ROW LEVEL SECURITY;

-- 8. RLS for admin_category_permissions
CREATE POLICY "admin_category_permissions_select"
  ON public.admin_category_permissions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_category_permissions_manage"
  ON public.admin_category_permissions FOR ALL
  TO authenticated USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 9. Update helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND admin_level = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND admin_level IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 10. Update RLS policies for events (allow admin, not just super_admin)
DROP POLICY IF EXISTS "events_admin_all" ON public.events;
CREATE POLICY "events_admin_all"
  ON public.events FOR ALL
  TO authenticated USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- 11. Rewrite signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _admin_level admin_level;
  _meta jsonb;
  _first_name text;
  _last_name text;
  _full_name text;
BEGIN
  _meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  IF NEW.email IN ('stefano.pollastri25@gmail.com', 'giu.pollastri@gmail.com') THEN
    _admin_level := 'super_admin';
  ELSE
    _admin_level := 'none';
  END IF;

  _first_name := COALESCE(_meta->>'first_name', _meta->>'given_name', NULL);
  _last_name := COALESCE(_meta->>'last_name', _meta->>'family_name', NULL);
  IF _first_name IS NULL AND _last_name IS NULL THEN
    _full_name := COALESCE(_meta->>'full_name', _meta->>'name');
    IF _full_name IS NOT NULL AND _full_name != '' THEN
      _first_name := split_part(_full_name, ' ', 1);
      IF position(' ' in _full_name) > 0 THEN
        _last_name := substring(_full_name from position(' ' in _full_name) + 1);
      END IF;
    END IF;
  END IF;

  INSERT INTO public.users (
    id, email, user_type, admin_level, status,
    first_name, last_name, phone_encrypted,
    created_at, updated_at
  ) VALUES (
    NEW.id, NEW.email, 'utente', _admin_level, 'active',
    _first_name, _last_name, _meta->>'phone_encrypted',
    NOW(), NOW()
  );
  RETURN NEW;
END;
$$;
