-- Add missing profile fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS service_radius INTEGER;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS zones_of_operation TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS regulations TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_marketplace_listed BOOLEAN DEFAULT false;
