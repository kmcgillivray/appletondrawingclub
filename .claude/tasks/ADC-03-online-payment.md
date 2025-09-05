# ADC-03: Online Payment Registration

## User Story
As a user, I want to reserve a spot for an event by paying online so that I can secure my spot immediately and avoid handling cash at the event.

## Acceptance Criteria
- [ ] User can select online payment option in registration form
- [ ] Form creates Stripe checkout session for event payment
- [ ] User is redirected to Stripe's secure payment page
- [ ] Successful payment creates registration in database via webhook
- [ ] User is redirected back to event page with success message
- [ ] Failed payments show appropriate error messages
- [ ] Registration includes payment_method='online' and payment_status='completed'
- [ ] Stripe webhook handles payment confirmation securely
- [ ] Form shows loading states during payment processing

## Prerequisites
- ADC-02 (Pay-at-Door Registration) completed
- Stripe account created
- Registration form component exists

## Implementation Steps

### 1. Set Up Stripe Account and Keys

Create Stripe account and get API keys:
- Create Stripe account at stripe.com
- Get publishable key and secret key from dashboard
- Set up webhook endpoint for payment events

Add to `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 3. Update Registration Form with Online Payment Option

Update `src/lib/components/RegistrationForm.svelte`:
```svelte
<script>
  import { loadStripe } from '@stripe/stripe-js';
  
  export let eventId;
  export let eventPrice;
  export let eventTitle;
  
  let form = {
    name: '',
    email: '',
    newsletter_signup: false,
    payment_method: 'door' // 'door' or 'online'
  };
  
  let loading = false;
  let success = false;
  let error = '';
  
  const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
    }
  }
  
  async function handleOnlinePayment() {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        event_title: eventTitle,
        name: form.name,
        email: form.email,
        newsletter_signup: form.newsletter_signup,
        price: eventPrice
      })
    });
    
    const { sessionId, error: checkoutError } = await response.json();
    
    if (checkoutError) {
      throw new Error(checkoutError);
    }
    
    const stripeInstance = await stripe;
    const { error } = await stripeInstance.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message);
    }
  }
  
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
  }
</script>

{#if success}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-green-800 mb-2">Registration Successful!</h3>
    <p class="text-green-700">
      You're registered for this event. 
      {#if form.payment_method === 'door'}
        You can pay ${eventPrice} at the door. We'll send you a confirmation email shortly.
      {:else}
        Payment confirmation and event details will be sent to your email.
      {/if}
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
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input 
          type="email" 
          bind:value={form.email}
          required
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input 
              type="radio" 
              bind:group={form.payment_method}
              value="online"
              disabled={loading}
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span class="ml-2 text-sm">
              <strong>Pay Online Now</strong> - ${eventPrice} (secure payment with card)
            </span>
          </label>
          <label class="flex items-center">
            <input 
              type="radio" 
              bind:group={form.payment_method}
              value="door"
              disabled={loading}
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span class="ml-2 text-sm">
              <strong>Pay at Door</strong> - ${eventPrice} (cash or card at event)
            </span>
          </label>
        </div>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          bind:checked={form.newsletter_signup}
          id="newsletter"
          disabled={loading}
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label for="newsletter" class="ml-2 text-sm text-gray-700">
          Subscribe to our newsletter for event updates
        </label>
      </div>
    </div>
    
    {#if error}
      <div class="mt-4 text-red-600 text-sm">{error}</div>
    {/if}
    
    <button 
      type="submit"
      disabled={loading}
      class="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if loading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      {:else}
        {form.payment_method === 'online' ? 'Pay Online & Register' : 'Reserve Spot (Pay at Door)'}
      {/if}
    </button>
  </form>
{/if}
```

### 4. Create Stripe Checkout Session Function

Create `netlify/functions/create-checkout.js`:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { event_id, event_title, name, email, newsletter_signup, price } = JSON.parse(event.body);

        // Validate required fields
        if (!event_id || !event_title || !name || !email || !price) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: event_title,
                        description: `Event registration for ${event_title}`
                    },
                    unit_amount: Math.round(price * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.URL || 'http://localhost:5173'}/events/test-event?payment=success`,
            cancel_url: `${process.env.URL || 'http://localhost:5173'}/events/test-event?payment=cancelled`,
            metadata: {
                event_id,
                event_title,
                name,
                email,
                newsletter_signup: newsletter_signup ? 'true' : 'false'
            },
            customer_email: email
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.id })
        };
    } catch (error) {
        console.error('Checkout creation error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to create checkout session' })
        };
    }
};
```

### 5. Create Stripe Webhook Handler

Create `netlify/functions/stripe-webhook.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // Handle the event
    switch (stripeEvent.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(stripeEvent.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(stripeEvent.data.object);
            break;
        default:
            console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: 'Success' };
};

async function handleCheckoutCompleted(session) {
    try {
        const { event_id, event_title, name, email, newsletter_signup } = session.metadata;

        console.log('Creating registration for:', { event_id, name, email });

        // Create registration record
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([{
                event_id,
                name,
                email,
                payment_method: 'online',
                payment_status: 'completed',
                newsletter_signup: newsletter_signup === 'true'
            }])
            .select()
            .single();

        if (regError) {
            console.error('Failed to create registration:', regError);
            return;
        }

        console.log('Registration created successfully:', registration.id);
        
        // TODO: Send confirmation email (will be implemented in ADC-05)
        
    } catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}

async function handlePaymentFailed(paymentIntent) {
    console.error('Payment failed for intent:', paymentIntent.id);
    // TODO: Handle payment failure notifications
}
```

### 6. Configure Stripe Webhook

In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Add endpoint: `https://yoursite.netlify.app/.netlify/functions/stripe-webhook`
3. Listen for events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook signing secret to environment variables

### 7. Update Event Detail Page

Update `src/routes/events/test-event/+page.svelte` to pass event title:
```svelte
<script>
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  
  const event = {
    // ... existing event data
  };
</script>

<!-- Event details content -->

<div class="mt-8">
  <RegistrationForm 
    eventId={event.id} 
    eventPrice={event.price} 
    eventTitle={event.title}
  />
</div>
```

### 8. Add Environment Variables to Netlify

In Netlify dashboard, add environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Testing Criteria
- [ ] User can select between online payment and pay-at-door options
- [ ] Online payment redirects to Stripe checkout page
- [ ] Stripe checkout displays correct event details and price
- [ ] Successful payment creates registration with payment_status='completed'
- [ ] Failed payments redirect back with error message
- [ ] Webhook successfully processes payment confirmations
- [ ] Loading states show during payment processing
- [ ] Form validation works for both payment methods

## Files Created/Modified
- `src/lib/components/RegistrationForm.svelte` - Updated with online payment option
- `netlify/functions/create-checkout.js` - Stripe checkout session creation
- `netlify/functions/stripe-webhook.js` - Webhook handler for payment events
- `src/routes/events/test-event/+page.svelte` - Updated to pass event title
- `.env.local` - Added Stripe environment variables

## Next Steps
After completing this task, proceed to **ADC-04** to improve registration success/failure feedback and URL handling.