# ADC-04: Registration Success/Failure Feedback

## User Story
As a user, I want to see if my reservation was successful or not so that I know whether my registration went through and what to expect next.

## Acceptance Criteria
- [ ] User sees clear success message after successful registration
- [ ] Success message is different for online vs pay-at-door registrations
- [ ] User sees appropriate error message if registration fails
- [ ] Embedded checkout return URL shows payment status correctly
- [ ] Payment success shows confirmation with registration details
- [ ] Payment failure/cancellation shows helpful error messages with retry options
- [ ] Messages include next steps and contact information
- [ ] Error messages suggest solutions when possible
- [ ] Loading states show during form submission and checkout creation
- [ ] Messages are visually distinct and easy to understand
- [ ] Modal-based checkout provides clear completion feedback

## Prerequisites
- ADC-03 (Online Payment Registration) completed
- ADC-13 (Embedded Checkout UX) completed
- Modal-based checkout flow implemented
- Return URL handling configured

## Implementation Steps

### 1. Enhance Success/Error Message Components

Create `src/lib/components/RegistrationMessages.svelte`:
```svelte
<script>
  export let type = ''; // 'success-door', 'success-online', 'error', 'cancelled'
  export let message = '';
  export let eventPrice = 0;
  export let eventTitle = '';
</script>

{#if type === 'success-door'}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Registration Successful!</h3>
        <div class="mt-2 text-sm text-green-700">
          <p>You're registered for <strong>{eventTitle}</strong>.</p>
          <p class="mt-1">💰 <strong>Payment:</strong> Please bring ${eventPrice} (cash or card) to pay at the door.</p>
          <p class="mt-1">📧 <strong>Confirmation:</strong> Check your email for event details and reminders.</p>
          <p class="mt-1">❓ <strong>Questions?</strong> Contact us at hello@appletondrawingclub.com</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'success-online'}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Payment Successful!</h3>
        <div class="mt-2 text-sm text-green-700">
          <p>You're registered for <strong>{eventTitle}</strong> and your payment of ${eventPrice} has been processed.</p>
          <p class="mt-1">📧 <strong>Confirmation:</strong> Check your email for your receipt and event details.</p>
          <p class="mt-1">🎨 <strong>What to bring:</strong> Just yourself and your enthusiasm! We'll have all the drawing materials.</p>
          <p class="mt-1">❓ <strong>Questions?</strong> Contact us at hello@appletondrawingclub.com</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'cancelled'}
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">Payment Cancelled</h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>Your payment was cancelled and no charge was made to your card.</p>
          <p class="mt-1">💡 <strong>Still want to join?</strong> You can try paying online again or choose "Pay at Door" to reserve your spot.</p>
          <p class="mt-1">❓ <strong>Having trouble?</strong> Contact us at hello@appletondrawingclub.com and we'll help you register.</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'error'}
  <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">Registration Failed</h3>
        <div class="mt-2 text-sm text-red-700">
          <p>{message}</p>
          <p class="mt-1">💡 <strong>Try these solutions:</strong></p>
          <ul class="list-disc list-inside mt-1 space-y-1">
            <li>Check your internet connection and try again</li>
            <li>Make sure all required fields are filled out correctly</li>
            <li>Try refreshing the page and registering again</li>
            <li>Contact us at hello@appletondrawingclub.com for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
{/if}
```

### 2. Update Return Page to Handle Checkout Status

Update `src/routes/checkout/return/+page.svelte` (created in ADC-13):
```svelte
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import RegistrationMessages from '$lib/components/RegistrationMessages.svelte';
  
  let loading = true;
  let session = null;
  let error = '';
  let eventData = null;
  
  const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  
  onMount(async () => {
    const sessionId = $page.url.searchParams.get('session_id');
    
    if (!sessionId) {
      error = 'No session ID provided';
      loading = false;
      return;
    }
    
    try {
      const stripeInstance = await stripe;
      const { session: checkoutSession } = await stripeInstance.retrieveCheckoutSession(sessionId);
      session = checkoutSession;
      
      // Extract event data from session metadata
      if (session.metadata) {
        eventData = {
          title: session.metadata.event_title,
          price: parseFloat(session.amount_total) / 100 // Convert from cents
        };
      }
    } catch (e) {
      error = 'Failed to retrieve checkout session';
      console.error('Checkout session error:', e);
    } finally {
      loading = false;
    }
  });
  
  function getMessageType() {
    if (!session) return '';
    
    switch (session.status) {
      case 'complete':
        return 'success-online';
      case 'open':
        return 'cancelled';
      default:
        return 'error';
    }
  }
  
  function getErrorMessage() {
    if (session?.status === 'open') {
      return 'Payment was not completed. Your registration is still pending.';
    }
    return error || 'Something went wrong with your payment.';
  }
</script>

<svelte:head>
  <title>Payment Status - Appleton Drawing Club</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Checking your payment status...</p>
      </div>
    </div>
  {:else if error && !session}
    <RegistrationMessages 
      type="error"
      message={error}
    />
    <div class="mt-6 text-center">
      <a href="/events" class="text-green-600 hover:text-green-700 font-medium">← Back to Events</a>
    </div>
  {:else if session}
    <RegistrationMessages 
      type={getMessageType()}
      message={getErrorMessage()}
      eventPrice={eventData?.price || 0}
      eventTitle={eventData?.title || 'Unknown Event'}
    />
    
    <div class="mt-8 text-center space-y-4">
      {#if session.status === 'complete'}
        <p class="text-gray-600">You should receive a confirmation email shortly.</p>
      {:else if session.status === 'open'}
        <div class="space-y-2">
          <p class="text-gray-600">You can try paying again or choose to pay at the door.</p>
          <button 
            onclick="window.history.back()" 
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      {/if}
      
      <div class="pt-4 border-t border-gray-200">
        <a href="/events" class="text-green-600 hover:text-green-700 font-medium">← Back to Events</a>
      </div>
    </div>
  {/if}
</div>
```

### 3. Update Event Page for Pay-at-Door Success Messages

Update event pages to show success messages for pay-at-door registrations:
For pay-at-door registrations, the existing success state in `RegistrationForm.svelte` should be enhanced with the new `RegistrationMessages` component:

```svelte
<!-- Replace existing success state with: -->
{#if success}
  <RegistrationMessages 
    type="success-door"
    eventPrice={eventPrice}
    eventTitle={eventTitle}
  />
{:else}
  <!-- existing form markup -->
{/if}
```

### 4. Add Better Error Handling to Registration Edge Function

Update `supabase/functions/register/index.ts` with more specific error messages:
The registration edge function should include comprehensive validation and error messages. Focus on improving user-facing error messages and handling edge cases like duplicate registrations and invalid input.

### 5. Add Auto-Hide Functionality for Messages

The messages will automatically hide after 15 seconds and clean up URL parameters to keep the page clean.

## Testing Criteria
- [ ] Success message displays after successful pay-at-door registration
- [ ] Success message displays on return page after successful Stripe payment
- [ ] Cancelled/failed message displays on return page after payment issues
- [ ] Return page correctly retrieves and displays checkout session status
- [ ] Error messages display for various failure scenarios
- [ ] Messages include helpful next steps and contact information
- [ ] Loading states work properly during checkout session retrieval
- [ ] Error messages suggest appropriate solutions
- [ ] Different success messages for online vs door payments
- [ ] Retry functionality works for failed payments
- [ ] Navigation back to events works correctly

## Files Created/Modified
- `src/lib/components/RegistrationMessages.svelte` - New message display component
- `src/routes/checkout/return/+page.svelte` - Return page with status handling (from ADC-13)
- `src/lib/components/RegistrationForm.svelte` - Updated to use RegistrationMessages for success states
- `supabase/functions/register/index.ts` - Enhanced error handling and validation

## Next Steps
After completing this task, proceed to **ADC-05** to implement email confirmation system for successful registrations.