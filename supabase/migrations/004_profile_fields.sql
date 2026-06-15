-- Add profile fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_hourly_rate DECIMAL(10, 2);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS minimum_booking_hours INTEGER DEFAULT 2;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS service_area TEXT;