-- Add contract type, clauses, and KPI fields to contracts table
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

-- Add contract_types to contract_templates
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'event_service';
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_rain_clause BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_liquor_liability BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS has_non_solicitation BOOLEAN DEFAULT false;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS default_payment_schedule TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS default_scope TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS venue_access_rights TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS venue_power_water TEXT;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS uniform_conduct TEXT;