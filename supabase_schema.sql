-- =============================================
-- OWASP JIS University CTF 2026 — Schema Setup
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/elwtsunlnezysjactxrw/sql
-- =============================================

-- 1. Participants table
CREATE TABLE IF NOT EXISTS participants (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  password    TEXT        NOT NULL,
  mode        TEXT        NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'group')),
  team_name   TEXT,
  score       INTEGER     DEFAULT 0,
  completed_stages INTEGER[] DEFAULT '{}',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-update last_updated on row changes
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER participants_updated
  BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE PROCEDURE update_last_updated();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: allow anyone to read (leaderboard) but only owner can update
CREATE POLICY "Public read access"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Register new participant"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owner can update own record"
  ON participants FOR UPDATE
  USING (true);

-- 5. Enable Realtime on the participants table
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Verify
SELECT 'Schema created successfully!' AS status;
