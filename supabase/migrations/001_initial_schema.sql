-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#7D7254',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  source TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  pricing_type TEXT NOT NULL DEFAULT 'per_guest' CHECK (pricing_type IN ('per_guest', 'flat', 'hourly')),
  min_guests INTEGER,
  max_guests INTEGER,
  includes_bartenders INTEGER DEFAULT 1,
  includes_glassware BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  guest_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new_inquiry' CHECK (status IN ('new_inquiry', 'quoted', 'tentative', 'booked', 'deposit_paid', 'completed', 'cancelled')),
  total_price DECIMAL(10, 2) DEFAULT 0,
  deposit_amount DECIMAL(10, 2),
  balance_due DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  guest_count INTEGER NOT NULL,
  add_ons JSONB DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2),
  balance_due DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff assignments table
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'bartender',
  rate DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_stage_id ON contacts(stage_id);
CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_events_contact_id ON events(contact_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_quotes_org_id ON quotes(org_id);
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_pipeline_stages_org_id ON pipeline_stages(org_id);
CREATE INDEX idx_packages_org_id ON packages(org_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update their own organization" ON organizations
  FOR UPDATE USING (
    id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for users
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert users in their organization" ON users
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update users in their organization" ON users
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for contacts
CREATE POLICY "Users can view contacts in their organization" ON contacts
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert contacts in their organization" ON contacts
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update contacts in their organization" ON contacts
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete contacts in their organization" ON contacts
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for events
CREATE POLICY "Users can view events in their organization" ON events
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert events in their organization" ON events
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update events in their organization" ON events
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete events in their organization" ON events
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes in their organization" ON quotes
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert quotes in their organization" ON quotes
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update quotes in their organization" ON quotes
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete quotes in their organization" ON quotes
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their organization" ON invoices
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert invoices in their organization" ON invoices
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update invoices in their organization" ON invoices
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete invoices in their organization" ON invoices
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for packages
CREATE POLICY "Users can view packages in their organization" ON packages
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert packages in their organization" ON packages
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update packages in their organization" ON packages
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete packages in their organization" ON packages
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for pipeline_stages
CREATE POLICY "Users can view pipeline stages in their organization" ON pipeline_stages
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert pipeline stages in their organization" ON pipeline_stages
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update pipeline stages in their organization" ON pipeline_stages
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete pipeline stages in their organization" ON pipeline_stages
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for staff_assignments
CREATE POLICY "Users can view staff assignments in their organization" ON staff_assignments
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert staff assignments in their organization" ON staff_assignments
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update staff assignments in their organization" ON staff_assignments
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete staff assignments in their organization" ON staff_assignments
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
