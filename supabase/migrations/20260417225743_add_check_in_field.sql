-- Add check-in tracking field to registrations table
ALTER TABLE registrations
  ADD COLUMN checked_in BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the check-in field
COMMENT ON COLUMN registrations.checked_in IS 'Whether the registrant has checked in at the event';

-- Add index for efficient querying of check-in status by event
CREATE INDEX idx_registrations_checked_in ON registrations(event_id, checked_in);