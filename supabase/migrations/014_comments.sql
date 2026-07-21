-- Migration 014: Comments/Memos — polymorphic comments on contacts and events

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'event')),
  entity_id UUID NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_org ON comments(org_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_org_id_v2()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('app.current_org_id', TRUE),
    (SELECT org_id FROM users WHERE clerk_id = current_setting('app.current_clerk_id', TRUE) LIMIT 1)
  )::UUID;
$$;

DROP POLICY IF EXISTS "Users can view comments in their org" ON comments;
CREATE POLICY "Users can view comments in their org" ON comments
  FOR SELECT
  USING (org_id = get_user_org_id_v2());

DROP POLICY IF EXISTS "Users can insert comments in their org" ON comments;
CREATE POLICY "Users can insert comments in their org" ON comments
  FOR INSERT
  WITH CHECK (org_id = get_user_org_id_v2());

DROP POLICY IF EXISTS "Users can update comments in their org" ON comments;
CREATE POLICY "Users can update comments in their org" ON comments
  FOR UPDATE
  USING (org_id = get_user_org_id_v2())
  WITH CHECK (org_id = get_user_org_id_v2());

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE
  USING (author_id = current_setting('app.current_clerk_id', TRUE) AND org_id = get_user_org_id_v2());
