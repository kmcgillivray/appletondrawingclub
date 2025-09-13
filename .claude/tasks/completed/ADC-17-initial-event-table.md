# ADC-17: Initialize Events Database Table

## Objective
Move from hardcoded event data to a database-backed events system while maintaining static site generation capabilities.

## Current State
- Hardcoded event object in `src/routes/events/test-event/+page.svelte`
- Events data exists in `src/lib/data/events.ts` but test event is separate
- Static build process with prerendering enabled

## Implementation Plan

### 1. Database Schema Setup
- **Create Supabase migration** with normalized schema:

#### Locations Table
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `name` (TEXT, NOT NULL) - e.g., "The Photo Opp Studio"
  - `street_address` (TEXT, NOT NULL)
  - `locality` (TEXT, NOT NULL) - city
  - `region` (TEXT, NOT NULL) - state
  - `postal_code` (TEXT, NOT NULL)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### Events Table
  - `id` (TEXT, PRIMARY KEY) - event slug/identifier
  - `title` (TEXT, NOT NULL)
  - `date` (DATE, NOT NULL)
  - `time` (TEXT, NOT NULL)
  - `doors_open` (TEXT)
  - `location_id` (UUID, NOT NULL, FOREIGN KEY REFERENCES locations(id))
  - `model` (TEXT)
  - `session_leader` (TEXT)
  - `instructor` (TEXT)
  - `price` (DECIMAL, NOT NULL)
  - `capacity` (INTEGER)
  - `event_type` (TEXT, NOT NULL) - enum: figure_drawing, portrait, workshop, special_event
  - `status` (TEXT, NOT NULL) - enum: registration_open, completed
  - `special_notes` (TEXT)
  - `summary` (TEXT, NOT NULL)
  - `description` (TEXT, NOT NULL)
  - `image_url` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### 2. Database Seeding
- **Create `supabase/seed.sql`** following Supabase seeding conventions:
  - Insert locations first (with known UUIDs or use RETURNING clause)
  - Insert test event data referencing location IDs
  - Include existing events from `src/lib/data/events.ts` 
  - Handle location deduplication with INSERT ... ON CONFLICT
- **Run via `supabase db reset`** to apply migrations + seed data
- **Set up RLS policies** for service role access only (no public access needed)
- **Test data integrity** and foreign key relationships after seeding

### 3. SvelteKit Build-Time Data Fetching
- **No separate generation script needed** - SvelteKit handles this natively
- **Create `src/lib/data/events.server.js`** for server-side event fetching:
  - Export async function to fetch events with joined location data from Supabase
  - Use service role key for build-time database access
  - Transform normalized database records to Event TypeScript interface format
  - Handle errors gracefully (build should fail if database unavailable)
- **Import in route files** during build time for static generation
- **Environment variables** needed for build environment (same as existing Supabase vars)

### 4. Dynamic Routing Implementation
- **Create `src/routes/events/[slug]/+page.js`** for dynamic event pages:
  - Import async event fetching function from `events.server.js`
  - Use `entries()` function to fetch all events and generate static routes
  - Implement `load` function to get event by slug from fetched data
  - Enable prerendering for all event pages (`export const prerender = true`)
- **Update main events page** (`src/routes/events/+page.js`) to use database data
- **Remove hardcoded test event route** `src/routes/events/test-event/`
- **Update event page component** to be reusable for any event
- **Test static generation** ensures all event pages are pre-rendered at build time

### 5. Admin Interface (Future Phase)
- **Create admin routes** for event management (protected)
- **Implement CRUD operations** for events
- **Add form validation** and error handling
- **Enable real-time updates** during registration periods

## Technical Considerations

### Normalized Database Benefits
- **Location reuse**: Common venues like "The Photo Opp Studio" stored once
- **Consistency**: Updates to venue details automatically apply to all events
- **Admin efficiency**: Easier to manage venue information in one place
- **Data integrity**: Foreign key constraints ensure valid location references
- **Future extensibility**: Can add venue-specific details (contact info, amenities, etc.)

### Database Security Model
- **No client-side database access**: Events/locations tables never accessed from browser
- **Service role only**: Build-time fetching + Edge Functions use service role key
- **RLS can be minimal**: No public policies needed since no anon access
- **Simplified security**: No need for complex row-level permissions
- **Future admin access**: When admin interface is built, can add authenticated user policies
- **Registration table separate**: Existing registration system continues unchanged

### Static Build Compatibility
- Events fetched at build time, not runtime
- No client-side database dependencies for event display
- Maintains fast loading and SEO benefits
- Build fails if database unavailable (intentional)

### Event URL Structure
- Current: `/events/test-event`
- New: `/events/[slug]` where slug = event.id
- Maintains SEO-friendly URLs
- Supports historical event links

### Data Consistency
- Database becomes single source of truth
- TypeScript interfaces maintained for type safety
- Generated data file serves as build artifact
- Manual events.ts file eventually deprecated

## Environment Variables Needed
- `VITE_SUPABASE_URL` - Already configured
- `SUPABASE_SERVICE_ROLE_KEY` - For build-time data fetching (new)
- Consider separate build environment variables

## Rollout Plan
1. **Phase 1**: Database setup and data migration
2. **Phase 2**: Server-side data fetching utility (`events.server.js`)
3. **Phase 3**: Dynamic routing implementation with build-time fetching
4. **Phase 4**: Remove hardcoded test event
5. **Phase 5**: Update existing events.ts data (optional cleanup)

## Implementation Examples

### Seed File Example
```sql
-- supabase/seed.sql

-- Enable RLS but no public policies needed (service role only access)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Insert locations first
INSERT INTO locations (id, name, street_address, locality, region, postal_code) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'The Photo Opp Studio', '123 Main St', 'Appleton', 'WI', '54911'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Other Venue Name', '456 Oak Ave', 'Appleton', 'WI', '54915')
ON CONFLICT (id) DO NOTHING;

-- Insert events referencing locations
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
  'Join us for an **evening of life drawing** with mixed poses ranging from quick gesture sketches to longer studies...',
  'https://res.cloudinary.com/db5mnmxzn/image/upload/c_fill,g_center,h_750,w_750/v1703199034/IMG_8034_ab2tov.jpg'
) ON CONFLICT (id) DO NOTHING;
```

## SvelteKit Integration Example
```javascript
// src/lib/data/events.server.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // build-time only
)

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations(*)
    `)
  
  if (error) throw error
  
  // Transform to Event interface format
  return data.map(event => ({
    ...event,
    location: {
      name: event.location.name,
      address: {
        streetAddress: event.location.street_address,
        addressLocality: event.location.locality,
        addressRegion: event.location.region,
        postalCode: event.location.postal_code
      }
    }
  }))
}
```

```javascript
// src/routes/events/[slug]/+page.js
import { getAllEvents } from '$lib/data/events.server.js'

export const prerender = true

export async function entries() {
  const events = await getAllEvents()
  return events.map(event => ({ slug: event.id }))
}

export async function load({ params }) {
  const events = await getAllEvents()
  const event = events.find(e => e.id === params.slug)
  
  if (!event) {
    throw error(404, 'Event not found')
  }
  
  return { event }
}
```

## Success Criteria
- [ ] Events table created and populated
- [ ] Static build process works with database events
- [ ] All event pages render correctly as static pages
- [ ] Test event accessible at `/events/test-event` with database data
- [ ] Build process includes event generation step
- [ ] No runtime database dependencies for event display
