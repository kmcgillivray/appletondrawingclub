-- Add 'coming_soon' as a valid status option for events
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('registration_open', 'completed', 'coming_soon'));