-- =====================================================
-- Namo M1: RLS Policies + Auth Triggers
-- =====================================================

-- ─── Enable RLS on all tables ───────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: check if current user is super_admin ──

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── USERS table ────────────────────────────────────

-- Volontario can read own row (excluding phone_encrypted of others)
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Super admin can read all users
CREATE POLICY "users_select_admin"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Users can update their own non-sensitive fields
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Super admin can update any user
CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

-- ─── USER_TAGS table ────────────────────────────────

-- All authenticated users can read tags
CREATE POLICY "user_tags_select"
  ON public.user_tags FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin can insert/update/delete tags
CREATE POLICY "user_tags_insert_admin"
  ON public.user_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "user_tags_update_admin"
  ON public.user_tags FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "user_tags_delete_admin"
  ON public.user_tags FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ─── USER_TAG_ASSIGNMENTS table ─────────────────────

-- Volontario can read own assignments
CREATE POLICY "user_tag_assignments_select_own"
  ON public.user_tag_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin can read all assignments
CREATE POLICY "user_tag_assignments_select_admin"
  ON public.user_tag_assignments FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Only super_admin can manage assignments
CREATE POLICY "user_tag_assignments_insert_admin"
  ON public.user_tag_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "user_tag_assignments_delete_admin"
  ON public.user_tag_assignments FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ─── EVENTS table ───────────────────────────────────

-- Volontario can see published events
CREATE POLICY "events_select_volunteer"
  ON public.events FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Anonymous can see published aperto events
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  TO anon
  USING (status = 'published' AND type = 'aperto');

-- Super admin can see all events
CREATE POLICY "events_select_admin"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Only super_admin can create/update/delete events
CREATE POLICY "events_insert_admin"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ─── REGISTRATIONS table ────────────────────────────

-- Volontario can read own registrations
CREATE POLICY "registrations_select_own"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin can read all registrations
CREATE POLICY "registrations_select_admin"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Authenticated users can insert their own registrations
CREATE POLICY "registrations_insert_own"
  ON public.registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Super admin can insert registrations for anyone
CREATE POLICY "registrations_insert_admin"
  ON public.registrations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

-- Users can update own registrations (for cancellation)
CREATE POLICY "registrations_update_own"
  ON public.registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin can update any registration
CREATE POLICY "registrations_update_admin"
  ON public.registrations FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

-- NO DELETE policy — registrations are never deleted

-- ─── EXTERNAL_REGISTRATIONS table ───────────────────

-- Anonymous can insert (register for aperto events)
CREATE POLICY "external_registrations_insert_anon"
  ON public.external_registrations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Super admin can read all external registrations
CREATE POLICY "external_registrations_select_admin"
  ON public.external_registrations FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Super admin can update (for cancellation management)
CREATE POLICY "external_registrations_update_admin"
  ON public.external_registrations FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

-- Anonymous can update own registration via cancel_token (handled via API route)

-- ─── AUDIT_LOG table ────────────────────────────────

-- Any authenticated user can INSERT (log actions)
CREATE POLICY "audit_log_insert"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only super_admin can SELECT (view audit log)
CREATE POLICY "audit_log_select_admin"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- NO UPDATE or DELETE policies — audit log is append-only

-- ─── NOTIFICATION_PREFERENCES table ─────────────────

-- Users can read own preferences
CREATE POLICY "notification_preferences_select_own"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin can read all preferences
CREATE POLICY "notification_preferences_select_admin"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Users can insert own preferences
CREATE POLICY "notification_preferences_insert_own"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own preferences
CREATE POLICY "notification_preferences_update_own"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin can update any preferences
CREATE POLICY "notification_preferences_update_admin"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

-- ─── TRIGGERS ───────────────────────────────────────

-- Sync auth.users → public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, status, role)
  VALUES (NEW.id, NEW.email, 'pending', 'volontario');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Auto-assign super_admin role for known admin emails
CREATE OR REPLACE FUNCTION public.handle_admin_email_match()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IN ('stefano.pollastri25@gmail.com', 'giu.pollastri@gmail.com') THEN
    UPDATE public.users SET role = 'super_admin', status = 'active'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_email_match();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
