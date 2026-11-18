-- Addendum: Moving Motivators public self-assessment flow
-- See SPEC_MOVING_MOTIVATORS_ADDENDUM.md for full rationale.

-- Phase A: schema only, no application code.

-- New table: moving_motivator_submissions
-- Written only by the NestJS backend via the service-role key. No RLS
-- policy is granted to anon/authenticated — the table is unreachable
-- directly from PostgREST under those roles.
CREATE TABLE public.moving_motivator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  macrodomain VARCHAR(255) NOT NULL
    CHECK (macrodomain IN ('CX & Engagement','Business Line','Enterprise Technology','Enablement Service','Technology Foundation')),
  priorities JSONB NOT NULL,
    -- [{ "motivator": "Curiosidad", "priorityOrder": 3 }, ...]  (1 = most important, 10 = least)
  impacts JSONB NOT NULL,
    -- [{ "motivator": "Curiosidad", "impact": 2 }, ...]          (-4..+4)
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_priorities_count CHECK (jsonb_array_length(priorities) = 10),
  CONSTRAINT valid_impacts_count CHECK (jsonb_array_length(impacts) = 10)
);

-- NOTE: no UNIQUE(email) constraint — per Ambiguity #3/#10 of the addendum,
-- duplicate detection (by name OR email, case-insensitive) is handled in
-- application logic with an explicit confirm-before-delete step, not a
-- DB-level upsert.
CREATE INDEX idx_mms_email_lower ON moving_motivator_submissions (lower(trim(email)));
CREATE INDEX idx_mms_name_lower ON moving_motivator_submissions (lower(trim(name)));

ALTER TABLE moving_motivator_submissions ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/DELETE policy for `anon` or `authenticated` roles.
-- All access goes through the NestJS backend using the Supabase service-role key:
--   - INSERT/DELETE: public endpoint, service role, per the confirm-replace flow
--   - SELECT: authenticated endpoints only, service role, filtered server-side

-- Schema change to existing table: gemba_records
ALTER TABLE public.gemba_records
  ADD COLUMN architect_email VARCHAR(255);
-- Nullable: existing records predate this field; facilitator backfills when editing.
-- Used ONLY as the join key to moving_motivator_submissions. Not unique (a
-- facilitator could theoretically mistype), validated as email format at
-- the form layer, not the DB layer.

-- gemba_moving_motivators is intentionally left untouched (frozen, not
-- dropped, not migrated) — see Ambiguity #5 of the addendum.
