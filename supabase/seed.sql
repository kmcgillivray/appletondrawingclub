-- Seed file for initial test event data
-- This populates the database with just the test event for initial schema setup

-- Insert The Photo Opp Studio location (using fixed UUID for consistency)
INSERT INTO locations (id, name, street_address, locality, region, postal_code) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'The Photo Opp Studio', '621 N Bateman Street', 'Appleton', 'WI', '54911')
ON CONFLICT (id) DO NOTHING;

-- Insert test event data (from src/routes/events/test-event/+page.svelte)
INSERT INTO events (
  id, title, date, time, doors_open, location_id, model, session_leader, 
  price, capacity, event_type, status, special_notes, summary, description, image_url
) VALUES (
  'test-event',
  'Mixed Pose Life Drawing',
  '2024-03-14',
  '7:00-9:00PM',
  '6:30PM',
  '550e8400-e29b-41d4-a716-446655440000',
  'Professional model',
  'Kevin McGillivray',
  15.00,
  20,
  'figure_drawing',
  'registration_open',
  'Bring your own drawing materials',
  'Mixed pose life drawing session with professional model. Perfect for all skill levels.',
  'Join us for an **evening of life drawing** with mixed poses ranging from quick gesture sketches to longer studies. 

This is a perfect opportunity for artists of all skill levels to practice their figure drawing techniques in a supportive, welcoming environment.

### What to Expect
- **Warm-up sketches** (2-5 minutes)
- **Medium poses** (10-15 minutes) 
- **Long pose** (20+ minutes)
- All drawing materials provided
- Friendly, supportive atmosphere',
  'https://res.cloudinary.com/db5mnmxzn/image/upload/c_fill,g_center,h_750,w_750/v1703199034/IMG_8034_ab2tov.jpg'
) ON CONFLICT (id) DO NOTHING;