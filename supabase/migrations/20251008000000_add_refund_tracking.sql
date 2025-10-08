-- Add refund tracking fields to registrations table
ALTER TABLE registrations
  ADD COLUMN refunded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN refund_reason TEXT,
  ADD COLUMN refund_amount NUMERIC(10, 2),
  ADD COLUMN stripe_refund_id TEXT;

-- Add comment explaining the refund tracking fields
COMMENT ON COLUMN registrations.refunded_at IS 'Timestamp when the refund was processed';
COMMENT ON COLUMN registrations.refund_reason IS 'Optional reason for the refund';
COMMENT ON COLUMN registrations.refund_amount IS 'Amount refunded in dollars (useful for partial refunds)';
COMMENT ON COLUMN registrations.stripe_refund_id IS 'Stripe refund transaction ID for online payments';

-- Update payment_status comment to include 'refunded' as a valid value
COMMENT ON COLUMN registrations.payment_status IS 'Payment status: pending, completed, or refunded';

-- Note: When implementing capacity checking, use the following query pattern to exclude refunded registrations:
-- SELECT event_id, SUM(quantity) as total_attendees
-- FROM registrations
-- WHERE event_id = $1
-- AND payment_status IN ('pending', 'completed')
-- GROUP BY event_id;
