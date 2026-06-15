-- IMPORTANT: Run migrations first before this seed!
-- Make sure migrations 001-004 have been applied

-- OnTap Test Data
-- This creates a demo organization with basic data

-- Create a demo organization (using only base columns that exist by default)
INSERT INTO organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Craft Cocktail Co.', 'craft-cocktail-co')
ON CONFLICT (slug) DO NOTHING;

-- Now add the profile fields if they don't exist (run this separately if migrations failed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'description') THEN
    ALTER TABLE organizations ADD COLUMN description TEXT;
    ALTER TABLE organizations ADD COLUMN phone TEXT;
    ALTER TABLE organizations ADD COLUMN email TEXT;
    ALTER TABLE organizations ADD COLUMN city TEXT;
    ALTER TABLE organizations ADD COLUMN state TEXT;
    ALTER TABLE organizations ADD COLUMN service_area TEXT;
    ALTER TABLE organizations ADD COLUMN default_hourly_rate DECIMAL(10, 2);
    ALTER TABLE organizations ADD COLUMN minimum_booking_hours INTEGER DEFAULT 2;
  END IF;
END $$;

-- Update the organization with additional details
UPDATE organizations SET 
  description = 'Premium mobile bar service for weddings and events',
  phone = '(555) 123-4567',
  email = 'hello@craftcocktailco.com',
  city = 'Austin',
  state = 'TX',
  service_area = 'Central Texas',
  default_hourly_rate = 75,
  minimum_booking_hours = 4
WHERE slug = 'craft-cocktail-co';

-- Create pipeline stages (they use org_id reference so they'll fail if org doesn't exist first)
INSERT INTO pipeline_stages (org_id, name, "order", color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New Inquiry', 0, '#7D7254'),
  ('00000000-0000-0000-0000-000000000001', 'Quoted', 1, '#B2A88A'),
  ('00000000-0000-0000-0000-000000000001', 'Tentative', 2, '#F3E7D3'),
  ('00000000-0000-0000-0000-000000000001', 'Booked', 3, '#7D6854'),
  ('00000000-0000-0000-0000-000000000001', 'Completed', 4, '#7D7254')
ON CONFLICT DO NOTHING;

-- Create packages
INSERT INTO packages (org_id, name, description, base_price, pricing_type, min_guests, max_guests, includes_bartenders, includes_glassware, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Standard Package', 'Basic bar service with standard drinks', 35.00, 'per_guest', 25, 75, 1, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Premium Package', 'Full bar service with premium spirits', 55.00, 'per_guest', 50, 150, 2, true, true),
  ('00000000-0000-0000-0000-000000000001', 'Luxury Package', 'Premium service with specialty cocktails', 85.00, 'per_guest', 100, 300, 3, true, true)
ON CONFLICT DO NOTHING;

-- Create sample contacts
INSERT INTO contacts (org_id, name, email, phone, source, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah Johnson', 'sarah.j@email.com', '(555) 234-5678', 'instagram', 'Interested in wedding for 150 guests'),
  ('00000000-0000-0000-0000-000000000001', 'Michael Chen', 'mchen@techcorp.com', '(555) 345-6789', 'referral', 'Corporate holiday party')
ON CONFLICT DO NOTHING;