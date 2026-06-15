-- ============================================================
-- Migration 010: Fix RLS recursion + apply missing migrations
-- ============================================================

-- 0. Create missing tables before altering them

-- Contract templates (must exist before contracts)
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts (references contract_templates)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  total_amount DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'completed', 'cancelled')),
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Support requests
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('help', 'bug', 'feature', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_contracts_event_id ON contracts(event_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contact_id ON contracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_templates_org_id ON contract_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- 1. SECURITY DEFINER helper to break RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub' LIMIT 1;
$$;

-- 2. Drop ALL existing RLS policies that use the recursive pattern
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'organizations','users','contacts','events','quotes','invoices',
        'packages','pipeline_stages','staff_assignments','gallery_items',
        'messages','contracts','contract_templates','support_requests'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- 3. Recreate policies using get_user_org_id() — no more recursion

-- ORGANIZATIONS
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = get_user_org_id());

-- USERS (the table that caused recursion)
CREATE POLICY "users_select" ON users FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "users_update" ON users FOR UPDATE USING (org_id = get_user_org_id());

-- CONTACTS
CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (org_id = get_user_org_id());

-- EVENTS
CREATE POLICY "events_select" ON events FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "events_update" ON events FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "events_delete" ON events FOR DELETE USING (org_id = get_user_org_id());

-- QUOTES
CREATE POLICY "quotes_select" ON quotes FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "quotes_insert" ON quotes FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "quotes_update" ON quotes FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "quotes_delete" ON quotes FOR DELETE USING (org_id = get_user_org_id());

-- INVOICES
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (org_id = get_user_org_id());

-- PACKAGES
CREATE POLICY "packages_select" ON packages FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "packages_insert" ON packages FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "packages_update" ON packages FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "packages_delete" ON packages FOR DELETE USING (org_id = get_user_org_id());

-- PIPELINE STAGES
CREATE POLICY "stages_select" ON pipeline_stages FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "stages_insert" ON pipeline_stages FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "stages_update" ON pipeline_stages FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "stages_delete" ON pipeline_stages FOR DELETE USING (org_id = get_user_org_id());

-- STAFF ASSIGNMENTS
CREATE POLICY "staff_assignments_select" ON staff_assignments FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "staff_assignments_insert" ON staff_assignments FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "staff_assignments_update" ON staff_assignments FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "staff_assignments_delete" ON staff_assignments FOR DELETE USING (org_id = get_user_org_id());

-- MESSAGES
CREATE POLICY "messages_select" ON messages FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- GALLERY ITEMS (org members get full access)
CREATE POLICY "gallery_org_all" ON gallery_items FOR ALL USING (org_id = get_user_org_id());

-- CONTRACTS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "contracts_insert" ON contracts FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "contracts_update" ON contracts FOR UPDATE USING (org_id = get_user_org_id());

-- CONTRACT TEMPLATES
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select" ON contract_templates FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "templates_insert" ON contract_templates FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "templates_update" ON contract_templates FOR UPDATE USING (org_id = get_user_org_id());

-- SUPPORT REQUESTS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_requests_select" ON support_requests FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "support_requests_insert" ON support_requests FOR INSERT WITH CHECK (true);

-- 4. Public read policies (for public profile pages)
CREATE POLICY "org_public_select" ON organizations FOR SELECT USING (true);
CREATE POLICY "packages_public_select" ON packages FOR SELECT USING (true);
CREATE POLICY "gallery_public_select" ON gallery_items FOR SELECT USING (is_public = true);

-- 5. Waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_public_insert" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "waitlist_public_select" ON waitlist FOR SELECT USING (true);

-- 6. Support tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_select" ON support_tickets FOR SELECT USING (true);
CREATE POLICY "tickets_insert" ON support_tickets FOR INSERT WITH CHECK (true);

-- 7. User preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs_select" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "prefs_insert" ON user_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "prefs_update" ON user_preferences FOR UPDATE USING (true);

-- 8. Setup progress
ALTER TABLE user_setup_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "setup_select" ON user_setup_progress FOR SELECT USING (true);
CREATE POLICY "setup_insert" ON user_setup_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "setup_update" ON user_setup_progress FOR UPDATE USING (true);

-- 9. Contract enhancements (migration 006)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'event_service';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS rain_clause BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS liquor_liability BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_schedule TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS venue_access_rights TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS venue_power_water TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS non_solicitation BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS uniform_conduct TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS inquiry_date TIMESTAMPTZ;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS first_sent_date TIMESTAMPTZ;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS alcohol_cogs_percentage DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS setup_hours DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_hours DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS teardown_hours DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_labor_hours DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS revenue_per_hour DECIMAL(10,2);

ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'event_service';
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_rain_clause BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_liquor_liability BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_non_solicitation BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS default_payment_schedule TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS default_scope TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS venue_access_rights TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS venue_power_water TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS uniform_conduct TEXT;

-- 10. Documents table RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (true);

-- 11. Missing updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contracts_updated_at') THEN
    CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contract_templates_updated_at') THEN
    CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
