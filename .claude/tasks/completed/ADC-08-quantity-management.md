# ADC-08: Quantity Management for Event Registrations

## Overview

Implement "restaurant-style" registration allowing users to register multiple people for events without requiring individual names. Users specify quantity (1-6 people) and pay for the total group through either online payment (Stripe) or pay-at-door.

## Current State

- Registration supports single person only
- Database schema assumes one person per registration
- Dual payment system: Stripe online payments and pay-at-door
- No capacity tracking beyond individual registrations
- Payment calculation is per-person only for both payment methods

## Business Requirements

### User Stories

- **As a user**, I want to register multiple people (myself + friends) in one form submission
- **As a user**, I don't want to enter names for everyone in my group
- **As an admin**, I want to see total attendee count for capacity management
- **As an admin**, I want simple check-in process ("John's party of 3")

### Constraints

- Maximum 6 people per registration (reasonable for intimate drawing events)
- Maintain simple UI/UX
- Support both payment methods: online (Stripe) and pay-at-door
- No unique email constraint initially (allow multiple registrations per email per event)

## Technical Implementation

### Database Changes

#### Add Quantity Field

```sql
-- Add quantity column to existing registrations table
ALTER TABLE registrations ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add check constraint for reasonable quantities
ALTER TABLE registrations ADD CONSTRAINT valid_quantity CHECK (quantity >= 1 AND quantity <= 6);
```

Note: The existing registrations table already includes:
- `payment_method` (TEXT) - 'door' or 'online'
- `payment_status` (TEXT) - 'pending' or 'completed'
- `stripe_customer_id` (TEXT) - For linking to Stripe customer records
- `stripe_session_id` (TEXT) - For online payment tracking
- `processing_status` (TEXT) - For registration workflow status

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
    <option value={5}>5 people</option>
    <option value={6}>6 people</option>
  </select>
</div>

<!-- Update payment method display to show dynamic pricing -->
<div class="space-y-2">
  <label for="payment-online" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
    <input 
      id="payment-online"
      type="radio" 
      bind:group={form.payment_method}
      value="online"
      disabled={loading}
      class="w-3"
    />
    <span class="pl-3">
      <strong>Pay online now</strong> - ${eventPrice * form.quantity} (secure payment with card)
    </span>
  </label>
  <label for="payment-door" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
    <input 
      id="payment-door"
      type="radio" 
      bind:group={form.payment_method}
      value="door"
      disabled={loading}
      class="w-3"
    />
    <span class="pl-3">
      <strong>Pay at door</strong> - ${eventPrice * form.quantity} (cash at event)
    </span>
  </label>
</div>
```

#### Form Data Structure

```typescript
// Update RegistrationFormData interface in src/lib/types.ts
export interface RegistrationFormData {
  name: string;
  email: string;
  quantity: number; // Add quantity field
  newsletter_signup: boolean;
}

// The form also includes payment_method but it's handled separately in the component
// Form structure in component:
let form: RegistrationFormData & { payment_method: PaymentMethod } = {
  name: '',
  email: '',
  quantity: 1, // Default to 1 person
  newsletter_signup: false,
  payment_method: 'online' // 'door' or 'online'
};
```

### Backend Updates

#### Edge Function Changes

```typescript
// Update RegistrationRequest interface in supabase/functions/_shared/types.ts
export interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  quantity: number; // Add quantity field
  payment_method: string;
  newsletter_signup: boolean;
  processing_status?: string;
  website?: string; // Honeypot field
}

// Add quantity validation in register/index.ts
if (!quantity || quantity < 1 || quantity > 6) {
  return jsonResponse(
    { error: "Invalid quantity. Please select 1-6 people." },
    400
  );
}

// Update database insert to include quantity
const { data: registration, error: regError } = await supabase
  .from("registrations")
  .insert([
    {
      event_id,
      name,
      email,
      quantity, // Include quantity
      payment_method,
      payment_status: "pending",
      newsletter_signup: newsletter_signup || false,
      stripe_customer_id: customerId,
      processing_status: processing_status || "completed",
    },
  ])
  .select()
  .single();

// Note: No unique constraint initially, so no 23505 error handling needed
// Handle foreign key violation - event doesn't exist
if (regError?.code === "23503") {
  return jsonResponse(
    { error: "Event not found. Please check the event ID and try again." },
    400
  );
}
```

#### Checkout Flow Updates

Both `create-checkout` and Stripe webhook functions need to handle quantity:

```typescript
// In create-checkout/index.ts - update line items
const lineItems = [{
  price_data: {
    currency: 'usd',
    product_data: {
      name: eventTitle,
    },
    unit_amount: eventPrice * 100, // Convert to cents
  },
  quantity: requestData.quantity, // Use quantity from request
}];

// In stripe-webhook/index.ts - quantity is already handled through Stripe session
// No additional changes needed as total amount is automatically correct
```

### Capacity Tracking (Future Admin Features)

```sql
-- Calculate total attendees for an event (for future capacity management)
SELECT event_id, SUM(quantity) as total_attendees
FROM registrations
WHERE event_id = $1
AND payment_status IN ('pending', 'completed')
GROUP BY event_id;
```

```typescript
// Event capacity checking (for future implementation)
const totalAttendees = registrations.reduce(
  (sum, reg) => sum + reg.quantity,
  0
);
const spotsRemaining = event.capacity - totalAttendees;
```

## Implementation Steps

### Phase 1: Database & Backend

1. **Add quantity column** to registrations table
2. **Update Edge Functions** to handle quantity field (register, create-checkout)
3. **Add quantity validation** (1-6 people)
4. **Test both payment flows** with quantity

### Phase 2: Frontend

5. **Update TypeScript interfaces** for quantity field
6. **Add quantity selector** to registration form
7. **Update price calculation** to multiply by quantity (both payment methods)
8. **Update CheckoutModal** to pass quantity to create-checkout
9. **Update success messages** to reflect quantity
10. **Test form validation** and error handling for both payment flows

### Phase 3: Testing & Deployment

11. **Test pay-at-door flow** with various quantities
12. **Test online payment flow** with various quantities
13. **Verify capacity calculations** work correctly
14. **Monitor registration patterns** after deployment

## Edge Cases & Validation

### Validation Rules

- **Quantity**: Must be 1-6 (integer)
- **Capacity**: Check `SUM(quantity)` doesn't exceed event capacity (future feature)
- **Payment**: Calculate as `quantity × event_price` for both payment methods
- **Stripe Integration**: Quantity properly passed to checkout session

### Error Scenarios

- User tries to register more than 6 people → "Invalid quantity. Please select 1-6 people."
- Event at capacity → "Event is full. Join waitlist?" (future feature)
- Invalid quantity → "Please select 1-6 people"
- Payment processing fails → Standard payment error handling (existing)

### User Experience

- **Default quantity**: 1 person (most common case)
- **Clear pricing**: Show total cost prominently for both payment methods
- **Dynamic pricing**: Payment method labels update with quantity × price
- **Confirmation**: "Registration confirmed for 3 people" (pay-at-door) or successful payment confirmation (online)
- **Email**: "You registered John Smith + 2 others for Mixed Pose Drawing"

## Testing Scenarios

### Database Tests

- [ ] Quantity constraint prevents values < 1 or > 6
- [ ] Capacity calculation sums quantities correctly
- [ ] Database accepts registrations with quantity field

### API Tests

- [ ] Pay-at-door registration succeeds with valid quantity (1-6)
- [ ] Online payment registration succeeds with valid quantity (1-6)
- [ ] Registration fails with invalid quantity (0, 7, negative)
- [ ] Price calculation multiplies correctly in both flows
- [ ] Stripe checkout creates correct line items with quantity

### UI Tests

- [ ] Quantity dropdown shows all options (1-6)
- [ ] Price updates when quantity changes for both payment methods
- [ ] Form validates quantity before submission
- [ ] Success message shows correct attendee count
- [ ] CheckoutModal receives and uses quantity correctly

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

- `supabase/migrations/` - Database schema changes (add quantity column)
- `src/lib/types.ts` - Add quantity to RegistrationFormData interface
- `src/lib/components/RegistrationForm.svelte` - Add quantity selector and update pricing
- `src/lib/components/CheckoutModal.svelte` - Pass quantity to create-checkout
- `supabase/functions/register/index.ts` - Handle quantity validation and insertion
- `supabase/functions/create-checkout/index.ts` - Handle quantity in Stripe line items
- `supabase/functions/_shared/types.ts` - Update RegistrationRequest interface

## Migration Strategy

1. **Deploy database changes** first (backward compatible with DEFAULT 1)
2. **Update Edge Functions** to handle quantity (defaults to 1 for existing code)
3. **Deploy frontend changes** with quantity selector and dual payment support
4. **Test both payment flows** thoroughly
5. **Monitor** for any issues with existing registrations
