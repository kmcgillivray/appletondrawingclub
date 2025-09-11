# ADC-13: Improve Embedded Checkout UX with Modal and Return URL

## Overview
Replace the current awkward inline embedded checkout with a proper modal experience and implement return URL handling for payment status feedback.

## Current Issues
- Embedded checkout form renders inline on event page (awkward UX)
- No proper return URL configured for success/failure states
- No clear feedback when payment completes or fails
- User stays on same page after checkout interaction

## Implementation Plan

### 1. Modal-Based Checkout
**Problem**: Embedded form clutters the event page layout
**Solution**: Open checkout in a modal overlay

**Implementation**:
- Create reusable `CheckoutModal.svelte` component
- Add modal backdrop and close functionality
- Trigger modal when "Pay Online" is selected
- Mount embedded checkout inside modal container
- Handle modal state management (open/close)

### 2. Return URL Configuration
**Problem**: No proper completion flow after payment
**Solution**: Create dedicated return page with status handling

**Implementation**:
- Create `/checkout/return/+page.svelte` route
- Configure return URL in checkout session: `/checkout/return?session_id={CHECKOUT_SESSION_ID}`
- Extract session ID from URL parameters
- Fetch checkout session status from Stripe
- Handle two main states: `complete` (success) and `open` (failed/cancelled)

### 3. Status Handling Logic
**Problem**: No feedback on payment completion status
**Solution**: Comprehensive status checking and user feedback

**Implementation**:
- Create `getCheckoutStatus` utility function
- Use Stripe's `retrieveCheckoutSession` API
- Handle status cases:
  - `complete`: Show success message, registration confirmation
  - `open`: Show failure message with retry option
  - `expired`: Show expired session message
- Provide clear next steps for each status

### 4. Registration Integration
**Problem**: Need to show registration status without compromising security
**Solution**: Display payment status while letting webhook handle database updates

**Implementation**:
- Pass registration ID in checkout session metadata (for webhook use)
- On return page, only display status based on Stripe session data
- Do NOT update registration records from client-side code
- Show success/failure UI based on session.status
- Optionally poll registration status to reflect webhook updates
- Webhook remains responsible for all database modifications

### 5. UX Improvements
**Problem**: Confusing flow between form submission and payment
**Solution**: Clear progress indicators and state management

**Implementation**:
- Add loading states during checkout session creation
- Show progress indicators: "Creating checkout..." → "Processing payment..."
- Implement proper error boundaries for checkout failures
- Add retry mechanisms for failed checkout session creation
- Provide clear navigation back to event page

## File Structure

```
src/routes/
├── checkout/
│   └── return/
│       └── +page.svelte          # Return URL handler
├── events/
│   └── [slug]/
│       └── +page.svelte          # Updated to use modal
src/lib/
├── components/
│   ├── CheckoutModal.svelte      # New modal component
│   └── RegistrationForm.svelte   # Updated form logic
└── utils/
    └── checkout.ts               # Checkout utilities
```

## Technical Details

### Modal Implementation
- Use Svelte's reactive modal pattern
- Implement focus trapping for accessibility
- Handle escape key and backdrop clicks to close
- Ensure proper cleanup when modal closes

### Return URL Flow
```typescript
// In checkout session creation
return_url: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`

// In return page
const sessionId = url.searchParams.get('session_id');
const session = await stripe.retrieveCheckoutSession(sessionId);
```

### Status Handling
```typescript
switch (session.status) {
  case 'complete':
    // Show success message (webhook updates DB)
    // Display registration confirmation
    break;
  case 'open':
    // Show payment failed/cancelled message
    // Offer retry option (registration stays pending)
    break;
  case 'expired':
    // Show expired session message
    // Redirect back to event page
    break;
}
```

## Benefits
- **Better UX**: Modal keeps context while providing focused checkout experience
- **Clear feedback**: Users know immediately if payment succeeded or failed
- **Proper flow**: Return URL provides natural completion experience
- **Error handling**: Failed payments can be retried without losing registration data
- **Mobile friendly**: Modal approach works better on small screens

## Files to Modify
- `src/lib/components/RegistrationForm.svelte` - Remove inline checkout, add modal trigger
- `src/lib/components/CheckoutModal.svelte` - New modal component
- `src/routes/checkout/return/+page.svelte` - New return URL handler
- `src/lib/utils/checkout.ts` - New utility functions
- `supabase/functions/create-checkout/index.ts` - Add return URL configuration

## Testing Strategy
- Test modal open/close functionality
- Verify return URL works for successful payments
- Test failed payment retry flow
- Ensure proper error handling for network issues
- Validate mobile responsiveness of modal
- Test keyboard navigation and accessibility

## Priority
High - Improves core user experience and fixes awkward checkout flow