-- Migration 007: Stripe payments — membership dues + donations + app settings
-- ─────────────────────────────────────────────────────────────────────────────

-- Enum
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ─── Membership Payments ─────────────────────────────────
CREATE TABLE membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  period_year INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one completed payment per user per year
CREATE UNIQUE INDEX idx_membership_one_completed_per_year
  ON membership_payments (user_id, period_year)
  WHERE status = 'completed';

-- Index for webhook lookups
CREATE INDEX idx_membership_stripe_session ON membership_payments (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- ─── Donations ───────────────────────────────────────────
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  amount_cents INTEGER NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  message TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_donations_stripe_session ON donations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- ─── App Settings ────────────────────────────────────────
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default membership settings
INSERT INTO app_settings (key, value) VALUES
  ('membership_amount_cents', '3500'),
  ('membership_deadline_month', '12'),
  ('membership_deadline_day', '15');

-- ─── RLS Policies ────────────────────────────────────────

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- membership_payments: volunteers read own, admins read all
CREATE POLICY "Volunteers can read own membership payments"
  ON membership_payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all membership payments"
  ON membership_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_level IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Service can insert membership payments"
  ON membership_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service can update membership payments"
  ON membership_payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- donations: anyone can insert, admins can read
CREATE POLICY "Anyone can insert donations"
  ON donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read donations"
  ON donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_level IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Service can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- app_settings: anyone can read, only super_admins can update
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Super admins can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_level = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_level = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert app settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.admin_level = 'super_admin'
    )
  );
