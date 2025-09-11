-- Add Stripe customer ID column to registrations table
-- This enables customer tracking across multiple event registrations

-- Add the column as NOT NULL (all new registrations must have a customer)
ALTER TABLE registrations ADD COLUMN stripe_customer_id TEXT NOT NULL DEFAULT '';

-- Remove the default after adding the column (for future inserts)
ALTER TABLE registrations ALTER COLUMN stripe_customer_id DROP DEFAULT;

-- Add index for performance on customer lookups
CREATE INDEX idx_registrations_stripe_customer_id ON registrations (stripe_customer_id);

-- Add index for email + customer_id lookups (useful for finding existing customers)
CREATE INDEX idx_registrations_email_customer ON registrations (email, stripe_customer_id);