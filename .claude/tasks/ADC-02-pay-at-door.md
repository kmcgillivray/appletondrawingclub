# ADC-02: Pay-at-Door Registration

## User Story
As a user, I want to reserve a spot for an event by paying at the door so that I can secure my spot without needing to pay online.

## Acceptance Criteria
- [ ] User can see a registration form on the event detail page
- [ ] Form includes name field (required)
- [ ] Form includes email field (required) 
- [ ] Form includes newsletter opt-in checkbox (optional)
- [ ] Form shows "Pay at Door" as the payment option
- [ ] Form submission stores registration in database
- [ ] User sees success message after registration
- [ ] Registration includes payment_method='door' and payment_status='pending'
- [ ] Registration uses event_id='test-event' (simple string, no foreign key)
- [ ] Form validates required fields before submission
- [ ] Form handles errors gracefully
- [ ] Database stores all registration data correctly

## Prerequisites
- ADC-01 (Event Detail Page) completed
- Supabase account and project set up

## Implementation Steps

### 1. Set Up Supabase Database

Install Supabase CLI and set up project:
```bash
npm install -g supabase
npm install @supabase/supabase-js
```

Initialize and create migration:
```bash
supabase init
supabase migration new initial_schema
```

Create database schema in migration file:
```sql
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
```

### 2. Create Environment Configuration

Add to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Create Supabase Client

Create `src/lib/supabase.js`:
```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Create Registration Form Component

Create `src/lib/components/RegistrationForm.svelte`:
```svelte
<script>
  export let eventId;
  export let eventPrice;
  
  let form = {
    name: '',
    email: '',
    newsletter_signup: false
  };
  
  let loading = false;
  let success = false;
  let error = '';

  async function handleSubmit() {
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/.netlify/functions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          name: form.name,
          email: form.email,
          payment_method: 'door',
          newsletter_signup: form.newsletter_signup
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      success = true;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

{#if success}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-green-800 mb-2">Registration Successful!</h3>
    <p class="text-green-700">
      You're registered for this event. You can pay ${eventPrice} at the door. 
      We'll send you a confirmation email shortly.
    </p>
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit} class="bg-white border border-gray-200 rounded-lg p-6">
    <h3 class="text-lg font-bold mb-4">Register for This Event</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input 
          type="text" 
          bind:value={form.name}
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input 
          type="email" 
          bind:value={form.email}
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          bind:checked={form.newsletter_signup}
          id="newsletter"
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label for="newsletter" class="ml-2 text-sm text-gray-700">
          Subscribe to our newsletter for event updates
        </label>
      </div>
    </div>
    
    <div class="mt-4 p-3 bg-blue-50 rounded-lg">
      <p class="text-sm text-blue-800">
        <strong>Payment:</strong> You'll pay ${eventPrice} at the door when you arrive.
      </p>
    </div>
    
    {#if error}
      <div class="mt-4 text-red-600 text-sm">{error}</div>
    {/if}
    
    <button 
      type="submit"
      disabled={loading}
      class="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg disabled:opacity-50"
    >
      {loading ? 'Registering...' : 'Reserve My Spot (Pay at Door)'}
    </button>
  </form>
{/if}
```

### 5. Create Registration Processing Function

Create `netlify/functions/register.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { event_id, name, email, payment_method, newsletter_signup } = JSON.parse(event.body);

        // Validate required fields
        if (!event_id || !name || !email || !payment_method) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create registration
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([{
                event_id,
                name,
                email,
                payment_method,
                payment_status: 'pending',
                newsletter_signup: newsletter_signup || false
            }])
            .select()
            .single();

        if (regError) {
            throw regError;
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                registration: registration
            })
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```

### 6. Update Event Detail Page

Modify `src/routes/events/test-event/+page.svelte` to include the registration form:
```svelte
<script>
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  
  // Test event data - will be replaced with dynamic data later
  const event = {
    id: 'test-event',
    title: 'Mixed Pose Life Drawing',
    description: 'Join us for an evening of life drawing with mixed poses ranging from quick gesture sketches to longer studies.',
    date: '2024-03-14',
    time: '7:00-9:00PM', 
    location: 'The Photo Opp Studio, 123 Main St, Appleton, WI',
    price: 15.00,
    capacity: 20,
    event_type: 'figure_drawing',
    model: 'Professional model',
    special_notes: 'Bring your own drawing materials'
  };
</script>

<!-- Event details content here -->

<!-- Registration section -->
<div class="mt-8">
  <RegistrationForm eventId={event.id} eventPrice={event.price} />
</div>
```

## Testing Criteria
- [ ] Form displays correctly on event detail page
- [ ] Form validation prevents submission with empty required fields
- [ ] Successful form submission creates record in Supabase registrations table
- [ ] Success message displays after registration
- [ ] Error handling works for network issues
- [ ] Newsletter opt-in checkbox works correctly
- [ ] Registration data includes correct payment_method and status
- [ ] Event ID is stored as simple string 'test-event'

## Files Created/Modified
- `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql` - Database schema
- `src/lib/supabase.js` - Supabase client setup
- `src/lib/components/RegistrationForm.svelte` - Registration form component
- `netlify/functions/register.js` - Registration processing function
- `src/routes/events/test-event/+page.svelte` - Updated with registration form
- `.env.local` - Environment variables

## Next Steps
After completing this task, proceed to **ADC-03** to add online payment registration functionality.