-- Migration 012: Stripe Payments — Connect accounts + payment processing

-- Add Stripe Connect fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'disconnected';

-- Add Stripe payment tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT;
