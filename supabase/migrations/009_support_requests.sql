-- Support requests table for help/feature requests
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

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Policy: organization members can view their org's requests
CREATE POLICY "Org members can view support requests" ON support_requests
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Policy: anyone can create a request
CREATE POLICY "Anyone can create support requests" ON support_requests
  FOR INSERT WITH CHECK (true);

-- Policy: allow public to create (from contact form)
CREATE POLICY "Public can create support requests" ON support_requests
  FOR INSERT WITH CHECK (org_id IS NULL);