-- Drop existing table if exists
DROP TABLE IF EXISTS gallery_items;

-- Create gallery table for storing photos
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  caption TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for org queries
CREATE INDEX idx_gallery_org ON gallery_items(org_id);

-- Add index for featured items
CREATE INDEX idx_gallery_featured ON gallery_items(org_id, is_featured) WHERE is_featured = true;

-- Add RLS
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Allow org members to manage their own gallery
CREATE POLICY "Org members can manage gallery" ON gallery_items
  FOR ALL USING (org_id IN (
    SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

-- Allow public read of public gallery items
CREATE POLICY "Public can view public gallery" ON gallery_items
  FOR SELECT USING (is_public = true);