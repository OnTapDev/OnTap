-- Contracts table for CLM
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

-- Contract templates table
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

-- Indexes
CREATE INDEX idx_contracts_event_id ON contracts(event_id);
CREATE INDEX idx_contracts_contact_id ON contracts(contact_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contract_templates_org_id ON contract_templates(org_id);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view contracts in their organization" ON contracts
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert contracts in their organization" ON contracts
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update contracts in their organization" ON contracts
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- RLS Policies for contract_templates
CREATE POLICY "Users can view templates in their organization" ON contract_templates
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert templates in their organization" ON contract_templates
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
