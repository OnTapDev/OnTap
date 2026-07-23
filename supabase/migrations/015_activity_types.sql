-- Migration 015: Activity types for comments — structured activity logging on contacts and events

ALTER TABLE comments ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'note'
  CHECK (activity_type IN ('note', 'call', 'email', 'meeting', 'task', 'follow_up'));

CREATE INDEX IF NOT EXISTS idx_comments_activity_type ON comments(activity_type);
