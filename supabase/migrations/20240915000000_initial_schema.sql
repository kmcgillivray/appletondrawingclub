-- Registrations table (simplified for test version)
-- No events table needed yet - we'll use hardcoded event data
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, -- Simple string like 'test-event', no foreign key constraint
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- 'door' or 'online'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  newsletter_signup BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Only service role can create registrations (via webhook/function)
-- Public cannot directly insert registrations
CREATE POLICY "Service role can manage registrations" ON registrations FOR ALL USING (auth.role() = 'service_role');