# ADC-08: Quantity Management for Event Registrations

## Overview
Implement "restaurant-style" registration allowing users to register multiple people for events without requiring individual names. Users specify quantity (1-4 people) and pay for the total group.

## Current State
- Registration supports single person only
- Database schema assumes one person per registration
- No capacity tracking beyond individual registrations
- Payment calculation is per-person only

## Business Requirements

### User Stories
- **As a user**, I want to register multiple people (myself + friends) in one form submission
- **As a user**, I don't want to enter names for everyone in my group
- **As an admin**, I want to see total attendee count for capacity management
- **As an admin**, I want simple check-in process ("John's party of 3")

### Constraints
- Maximum 4 people per registration (reasonable for intimate drawing events)
- One registration per email per event (prevent duplicates)
- Maintain simple UI/UX

## Technical Implementation

### Database Changes

#### Add Quantity Field
```sql
-- Add quantity column to existing registrations table
ALTER TABLE registrations ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add check constraint for reasonable quantities
ALTER TABLE registrations ADD CONSTRAINT valid_quantity CHECK (quantity >= 1 AND quantity <= 4);

-- Add unique constraint to prevent duplicate registrations
ALTER TABLE registrations ADD CONSTRAINT unique_email_event UNIQUE (email, event_id);
```

#### Capacity Tracking Query
```sql
-- Calculate total attendees for an event
SELECT event_id, SUM(quantity) as total_attendees 
FROM registrations 
WHERE event_id = $1 
GROUP BY event_id;
```

### Frontend Updates

#### Registration Form Changes
```svelte
<!-- Add quantity selector to RegistrationForm.svelte -->
<div>
  <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
    How many people? *
  </label>
  <select 
    id="quantity"
    bind:value={form.quantity}
    required
    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
  >
    <option value={1}>Just me (1 person)</option>
    <option value={2}>2 people</option>
    <option value={3}>3 people</option>
    <option value={4}>4 people</option>
  </select>
</div>

<!-- Update price display -->
<div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
  <p class="text-sm text-blue-800">
    <strong>Payment:</strong> You'll pay ${eventPrice * form.quantity} 
    for {form.quantity} {form.quantity === 1 ? 'person' : 'people'} at the door.
  </p>
</div>
```

#### Form Data Structure
```typescript
// Update RegistrationFormData interface
export interface RegistrationFormData {
  name: string;
  email: string;
  quantity: number; // Add quantity field
  newsletter_signup: boolean;
}
```

### Backend Updates

#### Edge Function Changes
```typescript
// Update RegistrationRequest interface
export interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  quantity: number; // Add quantity field
  payment_method: string;
  newsletter_signup: boolean;
  website?: string; // Honeypot
}

// Add quantity validation
if (!quantity || quantity < 1 || quantity > 4) {
  return jsonResponse({ error: 'Invalid quantity. Please select 1-4 people.' }, 400)
}

// Update database insert
const { data: registration, error: regError } = await supabase
  .from('registrations')
  .insert([{
    event_id,
    name,
    email,
    quantity, // Include quantity
    payment_method,
    payment_status: 'pending',
    newsletter_signup: newsletter_signup || false
  }])
  .select()
  .single()

// Handle duplicate registration error
if (regError?.code === '23505') {
  return jsonResponse({ 
    error: 'You have already registered for this event. Contact us to modify your registration.' 
  }, 400)
}
```

### Admin Interface Considerations

#### Registration List Display
```typescript
// Display registrations with quantity info
interface RegistrationDisplay {
  id: string;
  name: string;
  email: string;
  quantity: number;
  created_at: string;
  // Show as "John Smith (3 people)" in admin interface
}
```

#### Capacity Management
```typescript
// Event capacity checking
const totalAttendees = registrations.reduce((sum, reg) => sum + reg.quantity, 0);
const spotsRemaining = event.capacity - totalAttendees;
```

## Implementation Steps

### Phase 1: Database & Backend
1. **Add quantity column** to registrations table
2. **Add unique constraint** for email/event_id combination  
3. **Update Edge Function** to handle quantity field
4. **Add quantity validation** (1-4 people)
5. **Test duplicate prevention** with new constraint

### Phase 2: Frontend
6. **Update TypeScript interfaces** for quantity field
7. **Add quantity selector** to registration form
8. **Update price calculation** to multiply by quantity
9. **Update success message** to reflect quantity
10. **Test form validation** and error handling

### Phase 3: Admin & Monitoring  
11. **Update admin queries** to sum quantities for capacity
12. **Test capacity calculations** with mixed quantities
13. **Monitor registration patterns** after deployment

## Edge Cases & Validation

### Validation Rules
- **Quantity**: Must be 1-4 (integer)
- **Capacity**: Check `SUM(quantity)` doesn't exceed event capacity
- **Duplicates**: One registration per email per event
- **Payment**: Calculate as `quantity × event_price`

### Error Scenarios
- User tries to register more than 4 people → "Maximum 4 people per registration"
- User tries to register for same event twice → "Already registered. Contact us to modify."
- Event at capacity → "Event is full. Join waitlist?" (future feature)
- Invalid quantity → "Please select 1-4 people"

### User Experience
- **Default quantity**: 1 person (most common case)
- **Clear pricing**: Show total cost prominently
- **Confirmation**: "Registration confirmed for 3 people"
- **Email**: "You registered John Smith + 2 others for Mixed Pose Drawing"

## Testing Scenarios

### Database Tests
- [ ] Quantity constraint prevents values < 1 or > 4
- [ ] Unique constraint prevents duplicate email/event combinations
- [ ] Capacity calculation sums quantities correctly

### API Tests  
- [ ] Registration succeeds with valid quantity (1-4)
- [ ] Registration fails with invalid quantity (0, 5, negative)
- [ ] Duplicate registration returns appropriate error
- [ ] Price calculation multiplies correctly

### UI Tests
- [ ] Quantity dropdown shows all options (1-4)
- [ ] Price updates when quantity changes
- [ ] Form validates quantity before submission
- [ ] Success message shows correct attendee count

## Future Enhancements

### Phase 2 Features (Post-MVP)
- **Group discounts**: "Bring 3+ friends, save $5 per person"
- **Waitlist**: When event reaches capacity
- **Capacity warnings**: "Only 3 spots remaining"
- **Group check-in**: QR codes or group names for easy check-in

### Advanced Features
- **Attendee names**: Optional field for group organizers
- **Group messaging**: Contact all registrants for event updates  
- **Split payments**: If moving to online payments
- **Group cancellation**: Handle partial refunds

## Success Metrics
- **Increased registrations**: Groups registering together
- **Reduced admin overhead**: Fewer individual registrations to manage
- **Maintained UX**: Form completion rates stay high
- **Accurate capacity**: No overbooking due to quantity miscounts

## Files to Modify
- `supabase/migrations/` - Database schema changes
- `src/lib/types.ts` - Add quantity to interfaces
- `src/lib/components/RegistrationForm.svelte` - Add quantity selector
- `supabase/functions/register/index.ts` - Handle quantity validation
- `supabase/functions/_shared/types.ts` - Update request types

## Migration Strategy
1. **Deploy database changes** first (backward compatible)
2. **Update backend** to handle quantity (defaults to 1)
3. **Deploy frontend changes** with quantity selector
4. **Monitor** for any issues with existing registrations
5. **Add unique constraint** after confirming no duplicates exist