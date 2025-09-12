-- Add foreign key constraint between registrations and events
-- This ensures registrations can only reference valid events

-- Add index on event_id for better performance with foreign key
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);

-- Add foreign key constraint
-- Note: This will fail if there are any registrations with event_id values 
-- that don't exist in the events table
ALTER TABLE registrations 
ADD CONSTRAINT fk_registrations_event_id 
FOREIGN KEY (event_id) REFERENCES events(id) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update the comment on the event_id column
COMMENT ON COLUMN registrations.event_id IS 'References events.id - must be a valid event ID';