-- ============================================================
-- Gluvia Production Email System Migration
-- Weekly Health Reports & Delivery Tracking
-- ============================================================

-- 1. Extend user profiles with email notification preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_weekly_report_sent_at TIMESTAMPTZ;

-- 2. Create delivery log table for idempotency and diagnostic tracking
CREATE TABLE IF NOT EXISTS public.weekly_report_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email     TEXT NOT NULL,
  period_start        TIMESTAMPTZ NOT NULL,
  period_end          TIMESTAMPTZ NOT NULL,
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  status              TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  provider_message_id TEXT,
  readings_count      INTEGER DEFAULT 0,
  average_sugar       INTEGER,
  lowest_sugar        INTEGER,
  highest_sugar       INTEGER,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure strict idempotency: one successful report per user per period
  CONSTRAINT unique_user_period_success UNIQUE (user_id, period_start, period_end)
);

-- 3. Indexes for query and delivery performance
CREATE INDEX IF NOT EXISTS idx_weekly_report_logs_user_id ON public.weekly_report_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_report_logs_sent_at ON public.weekly_report_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_weekly_report ON public.profiles(weekly_report_enabled) WHERE weekly_report_enabled = true;

-- 4. Enable Row Level Security
ALTER TABLE public.weekly_report_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own delivery logs
CREATE POLICY "weekly_report_logs_select_own" ON public.weekly_report_logs
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Service role has full access (Edge Function operates with service role)
-- By default, service_role bypasses RLS in Supabase.

-- ============================================================
-- Supabase Cron Configuration (Execute in Supabase SQL Editor)
-- ============================================================
-- Required extensions:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron Schedule: Every Monday at 08:00 AM UTC
-- Replace <PROJECT_REF> and <CRON_SECRET> with your actual project values:
/*
SELECT cron.schedule(
  'weekly-health-report-job',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/weekly-health-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/
