-- Migration 011: Profile Integration — new fields + inventory table

-- Add new profile fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS service_radius INTEGER;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS zones_of_operation TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS regulations TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_marketplace_listed BOOLEAN DEFAULT false;

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unit',
  reorder_level DECIMAL(10, 2),
  cost_per_unit DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_org ON inventory_items(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(org_id, category);

-- RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select" ON inventory_items FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "inventory_insert" ON inventory_items FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "inventory_update" ON inventory_items FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "inventory_delete" ON inventory_items FOR DELETE USING (org_id = get_user_org_id());

-- Updated_at trigger
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
