-- Add webhook reliability and idempotency fields to registrations table
-- This enables pending registration flow and prevents duplicate webhook processing

-- Add new columns for webhook reliability
ALTER TABLE registrations 
ADD COLUMN stripe_event_id TEXT,
ADD COLUMN stripe_session_id TEXT,  
ADD COLUMN processing_status TEXT DEFAULT 'completed';

-- Add unique constraint to prevent duplicate webhook processing
ALTER TABLE registrations 
ADD CONSTRAINT unique_stripe_event_id UNIQUE (stripe_event_id);

-- Add index for efficient session lookups during webhook processing
CREATE INDEX idx_registrations_stripe_session_id ON registrations (stripe_session_id);

-- Add index for processing status queries
CREATE INDEX idx_registrations_processing_status ON registrations (processing_status);