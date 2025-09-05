# ADC-04: Registration Success/Failure Feedback

## User Story
As a user, I want to see if my reservation was successful or not so that I know whether my registration went through and what to expect next.

## Acceptance Criteria
- [ ] User sees clear success message after successful registration
- [ ] Success message is different for online vs pay-at-door registrations
- [ ] User sees appropriate error message if registration fails
- [ ] Payment success redirects show confirmation on event page
- [ ] Payment failure redirects show helpful error messages
- [ ] URL parameters are cleaned up after showing messages
- [ ] Messages include next steps and contact information
- [ ] Error messages suggest solutions when possible
- [ ] Loading states show during form submission
- [ ] Messages are visually distinct and easy to understand

## Prerequisites
- ADC-03 (Online Payment Registration) completed
- Stripe redirects are configured
- Registration form handles both payment methods

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

### 2. Update Event Detail Page to Handle URL Parameters

Update `src/routes/events/test-event/+page.svelte`:
```svelte
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  import RegistrationMessages from '$lib/components/RegistrationMessages.svelte';
  
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
  
  let showMessage = '';
  let messageTimeout;
  
  onMount(() => {
    const urlParams = $page.url.searchParams;
    const payment = urlParams.get('payment');
    
    if (payment === 'success') {
      showMessage = 'success-online';
    } else if (payment === 'cancelled') {
      showMessage = 'cancelled';
    }
    
    // Clean up URL after 5 seconds and set message timeout
    if (showMessage) {
      messageTimeout = setTimeout(() => {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('payment');
        goto(newUrl.pathname, { replaceState: true });
        showMessage = '';
      }, 15000); // Show for 15 seconds
    }
  });
  
  // Clean up timeout on component destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
  });
  
  function handleRegistrationSuccess(event) {
    const { paymentMethod } = event.detail;
    showMessage = paymentMethod === 'online' ? 'success-online' : 'success-door';
    
    // Auto-hide after 15 seconds
    messageTimeout = setTimeout(() => {
      showMessage = '';
    }, 15000);
  }
  
  function handleRegistrationError(event) {
    const { message } = event.detail;
    showMessage = 'error';
    console.error('Registration error:', message);
  }
</script>

<svelte:head>
  <title>{event.title} - Appleton Drawing Club</title>
  <meta name="description" content="{event.description}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Message Display -->
  {#if showMessage}
    <RegistrationMessages 
      type={showMessage}
      eventPrice={event.price}
      eventTitle={event.title}
    />
  {/if}

  <!-- Event Header -->
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
      
      <!-- Event Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600">Date</div>
          <div class="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600">Time</div>
          <div class="font-semibold">{event.time}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600">Location</div>
          <div class="font-semibold">{event.location}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600">Price</div>
          <div class="font-semibold">${event.price}</div>
        </div>
      </div>
    </div>

    <!-- Event Description -->
    <div class="prose max-w-none mb-8">
      <p class="text-lg text-gray-700">{event.description}</p>
      
      {#if event.model}
        <p><strong>Model:</strong> {event.model}</p>
      {/if}
      
      {#if event.special_notes}
        <p><strong>Please note:</strong> {event.special_notes}</p>
      {/if}
    </div>

    <!-- Registration Form -->
    <div class="mt-8">
      <RegistrationForm 
        eventId={event.id} 
        eventPrice={event.price} 
        eventTitle={event.title}
        on:registrationSuccess={handleRegistrationSuccess}
        on:registrationError={handleRegistrationError}
      />
    </div>
  </div>
</div>
```

### 3. Update Registration Form to Emit Events

Update `src/lib/components/RegistrationForm.svelte` to emit success/error events:
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  // ... existing imports and variables
  
  const dispatch = createEventDispatcher();
  
  // ... existing code
  
  async function handleDoorPayment() {
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
    loading = false;
    
    // Emit success event
    dispatch('registrationSuccess', {
      paymentMethod: 'door',
      registration: result.registration
    });
  }
  
  // Update error handling to emit error events
  async function handleSubmit() {
    loading = true;
    error = '';
    
    try {
      if (form.payment_method === 'online') {
        await handleOnlinePayment();
      } else {
        await handleDoorPayment();
      }
    } catch (e) {
      error = e.message;
      loading = false;
      
      // Emit error event
      dispatch('registrationError', {
        message: e.message
      });
    }
  }
</script>

<!-- Rest of component stays the same -->
```

### 4. Add Better Error Handling to Registration Function

Update `netlify/functions/register.js` with more specific error messages:
```javascript
// ... existing code

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
        if (!event_id) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Event ID is required' })
            };
        }
        
        if (!name || name.trim().length < 2) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Please enter your full name' })
            };
        }
        
        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Please enter a valid email address' })
            };
        }
        
        if (!payment_method) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Please select a payment method' })
            };
        }

        // Check for existing registration
        const { data: existingReg } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event_id)
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existingReg) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'This email is already registered for this event' })
            };
        }

        // Create registration
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([{
                event_id,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                payment_method,
                payment_status: 'pending',
                newsletter_signup: newsletter_signup || false
            }])
            .select()
            .single();

        if (regError) {
            console.error('Database error:', regError);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unable to process registration. Please try again.' })
            };
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
            body: JSON.stringify({ error: 'Server error. Please try again or contact support.' })
        };
    }
};
```

### 5. Add Auto-Hide Functionality for Messages

The messages will automatically hide after 15 seconds and clean up URL parameters to keep the page clean.

## Testing Criteria
- [ ] Success message displays after successful pay-at-door registration
- [ ] Success message displays after returning from successful Stripe payment
- [ ] Cancelled message displays after returning from cancelled Stripe payment
- [ ] Error messages display for various failure scenarios
- [ ] Messages include helpful next steps and contact information
- [ ] URL parameters are cleaned up after messages display
- [ ] Messages auto-hide after reasonable time period
- [ ] Loading states work properly during form submission
- [ ] Error messages suggest appropriate solutions
- [ ] Different success messages for online vs door payments

## Files Created/Modified
- `src/lib/components/RegistrationMessages.svelte` - New message display component
- `src/routes/events/test-event/+page.svelte` - Updated to handle URL parameters and show messages
- `src/lib/components/RegistrationForm.svelte` - Updated to emit success/error events
- `netlify/functions/register.js` - Enhanced error handling and validation

## Next Steps
After completing this task, proceed to **ADC-05** to implement email confirmation system for successful registrations.