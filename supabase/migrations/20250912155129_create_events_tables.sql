-- Create locations table
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  locality TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  doors_open TEXT,
  location_id UUID NOT NULL REFERENCES locations(id),
  model TEXT,
  session_leader TEXT,
  instructor TEXT,
  price DECIMAL(10,2) NOT NULL,
  capacity INTEGER,
  event_type TEXT NOT NULL CHECK (event_type IN ('figure_drawing', 'portrait', 'workshop', 'special_event')),
  status TEXT NOT NULL CHECK (status IN ('registration_open', 'completed')) DEFAULT 'registration_open',
  special_notes TEXT,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on both tables (service role access only)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_location_id ON events(location_id);

-- Note: registrations.event_id remains TEXT with no foreign key constraint
-- This preserves the existing registration system without changes