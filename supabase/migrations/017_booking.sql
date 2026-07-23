-- Add booking settings to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT false;

-- Add show_on_booking flag to packages (for toggling on public booking page)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS show_on_booking BOOLEAN DEFAULT true;

-- Add deposit tracking to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS stripe_deposit_session_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS stripe_deposit_paid BOOLEAN DEFAULT false;
