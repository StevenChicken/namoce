-- ============================================================
-- 002_attendance_automations.sql
-- Auto-mark confirmed registrations as "present" after event ends
-- ============================================================

-- Add the attendance_grace_period_hours column to events (if not exists)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS attendance_grace_period_hours integer DEFAULT 48;

-- ─── Function: mark_attendance_as_present ──────────────────
-- Runs periodically to auto-mark confirmed (non-cancelled) registrations
-- as "present" once the event has ended.
-- Only touches rows where attendance_status IS NULL (admin corrections take priority).
-- SECURITY DEFINER to bypass RLS.

CREATE OR REPLACE FUNCTION mark_attendance_as_present()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE registrations r
  SET
    attendance_status = 'present',
    updated_at = NOW()
  FROM events e
  WHERE r.event_id = e.id
    AND e.end_at <= NOW()
    AND r.status = 'confirmed'
    AND r.attendance_status IS NULL;
END;
$$;

-- ─── pg_cron schedule: every hour at minute 0 ──────────────
-- Requires the pg_cron extension to be enabled in Supabase dashboard.
-- If pg_cron is not yet enabled, enable it via:
--   Supabase Dashboard → Database → Extensions → pg_cron → Enable

SELECT cron.schedule(
  'mark-attendance-as-present',   -- job name
  '0 * * * *',                    -- every hour
  $$SELECT mark_attendance_as_present()$$
);
