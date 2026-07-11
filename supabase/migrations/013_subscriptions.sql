-- Migration 013: Subscriptions — Stripe subscription management

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_period_end TIMESTAMPTZ;
