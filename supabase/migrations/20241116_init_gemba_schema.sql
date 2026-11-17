-- Gemba Arquitectura IB - Initial Schema

-- Table: gemba_records
CREATE TABLE public.gemba_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadata
  architect_name VARCHAR(255),
  macrodomain VARCHAR(255),
  initiative_name VARCHAR(255),
  business_referent VARCHAR(255),

  -- Phase 0: Preparar
  prep_value TEXT,
  prep_barrier TEXT,

  -- Phase 1: Gemba Baseline
  behaviors JSONB, -- [{state: 'si|par|no|na', fact: '', artifact: ''}, ...]
  flow_steps JSONB, -- [{step: '', objective: '', with: '', out: '', waste: ''}, ...]

  -- Phase 2: Diagnosis
  debrief_strength TEXT,
  debrief_selfgap TEXT,
  debrief_block TEXT,
  debrief_try TEXT,
  flow_qa JSONB, -- [q1_answer, q2_answer, q3_answer, q4_answer]
  gaps JSONB, -- [{text: '', type: '', evidence: '', condition: ''}, ...]
  conditions JSONB, -- [{name: '', status: 'si|par|no', evidence: ''}, ...]
  csat_score INT CHECK (csat_score IS NULL OR (csat_score >= 1 AND csat_score <= 5)),
  csat_comment TEXT,

  -- Computed fields
  is_complete BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'in_progress', 'complete'

  UNIQUE(user_id, architect_name),
  CONSTRAINT valid_macro_name CHECK (macrodomain IS NULL OR macrodomain != '')
);

-- Table: gemba_moving_motivators
CREATE TABLE public.gemba_moving_motivators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES gemba_records(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INT NOT NULL,
  impact INT DEFAULT 0 CHECK (impact >= -2 AND impact <= 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(record_id, name)
);

-- Table: gemba_settings
CREATE TABLE public.gemba_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  target_scope INT DEFAULT 5 CHECK (target_scope >= 1 AND target_scope <= 500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row-Level Security
ALTER TABLE gemba_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemba_moving_motivators ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemba_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users see/edit only their own records
CREATE POLICY "Users see own records"
  ON gemba_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own records"
  ON gemba_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own records"
  ON gemba_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own records"
  ON gemba_records FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for moving motivators (via record ownership)
CREATE POLICY "Users see own moving motivators"
  ON gemba_moving_motivators FOR SELECT
  USING (
    record_id IN (
      SELECT id FROM gemba_records WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own moving motivators"
  ON gemba_moving_motivators FOR INSERT
  WITH CHECK (
    record_id IN (
      SELECT id FROM gemba_records WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own moving motivators"
  ON gemba_moving_motivators FOR UPDATE
  USING (
    record_id IN (
      SELECT id FROM gemba_records WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own moving motivators"
  ON gemba_moving_motivators FOR DELETE
  USING (
    record_id IN (
      SELECT id FROM gemba_records WHERE user_id = auth.uid()
    )
  );

-- Policies for settings
CREATE POLICY "Users see own settings"
  ON gemba_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own settings"
  ON gemba_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own settings"
  ON gemba_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own settings"
  ON gemba_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_gemba_records_user_id ON gemba_records(user_id);
CREATE INDEX idx_gemba_records_created_at ON gemba_records(created_at DESC);
CREATE INDEX idx_gemba_moving_motivators_record_id ON gemba_moving_motivators(record_id);
CREATE INDEX idx_gemba_settings_user_id ON gemba_settings(user_id);
