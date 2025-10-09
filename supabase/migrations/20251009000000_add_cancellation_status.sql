-- Add cancellation tracking fields to registrations table
ALTER TABLE registrations
  ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN cancellation_reason TEXT;

-- Add comments explaining the cancellation tracking fields
COMMENT ON COLUMN registrations.cancelled_at IS 'Timestamp when the registration was cancelled';
COMMENT ON COLUMN registrations.cancellation_reason IS 'Optional reason for the cancellation';

-- Update payment_status comment to include 'cancelled' as a valid value
COMMENT ON COLUMN registrations.payment_status IS 'Payment status: pending, completed, refunded, or cancelled';

-- Note: When implementing capacity checking, use the following query pattern to exclude refunded and cancelled registrations:
-- SELECT event_id, SUM(quantity) as total_attendees
-- FROM registrations
-- WHERE event_id = $1
-- AND payment_status IN ('pending', 'completed')
-- GROUP BY event_id;
