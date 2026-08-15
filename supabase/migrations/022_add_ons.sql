-- Add add_ons table for customizable add-on services
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_add_ons_org ON add_ons(org_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_active ON add_ons(org_id, is_active);

-- RLS
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "add_ons_select" ON add_ons FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "add_ons_insert" ON add_ons FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "add_ons_update" ON add_ons FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "add_ons_delete" ON add_ons FOR DELETE USING (org_id = get_user_org_id());

-- Updated_at trigger
CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();