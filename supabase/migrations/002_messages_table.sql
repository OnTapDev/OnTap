-- Messages table for CRM communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
  recipient TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching messages by contact
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_org_id ON messages(org_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their organization" ON messages
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert messages in their organization" ON messages
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );
