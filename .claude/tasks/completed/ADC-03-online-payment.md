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

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration (if not already present)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SB_SECRET_KEY=your_supabase_secret_key
```

### 2. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 3. Update Registration Form with Online Payment Option

Update `src/lib/components/RegistrationForm.svelte` to add payment method selection:

```svelte
<script lang="ts">
  import { loadStripe } from '@stripe/stripe-js';
  import type { RegistrationFormData, RegistrationResponse } from '$lib/types';

  export let eventId: string;
  export let eventPrice: number;
  export let eventTitle: string;

  let form: RegistrationFormData & { payment_method: string } = {
    name: '',
    email: '',
    newsletter_signup: false,
    payment_method: 'door' // 'door' or 'online'
  };

  // Anti-spam field - should remain empty for legitimate users
  let website = '';

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
      error = e instanceof Error ? e.message : 'Registration failed';
      loading = false;
    }
  }

  async function handleOnlinePayment() {
    // Construct Supabase Edge Function URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({
        event_id: eventId,
        event_title: eventTitle,
        name: form.name,
        email: form.email,
        newsletter_signup: form.newsletter_signup,
        price: eventPrice,
        website: website // Anti-spam field
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
    // Use existing registration Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabasePublishableKey) {
      throw new Error('Missing Supabase configuration');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabasePublishableKey}`
      },
      body: JSON.stringify({
        event_id: eventId,
        name: form.name,
        email: form.email,
        payment_method: 'door',
        newsletter_signup: form.newsletter_signup,
        website: website // Anti-spam field
      })
    });

    const result: RegistrationResponse = await response.json();

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

### 4. Create Stripe Checkout Session Edge Function

Create `supabase/functions/create-checkout/index.ts`:

```typescript
import Stripe from "https://esm.sh/stripe@14.21.0";
import {
  jsonResponse,
  handleCors,
  isValidEmail,
  validateRequired,
} from "../_shared/utils.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

Deno.serve(async (req): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const {
      event_id,
      event_title,
      name,
      email,
      newsletter_signup,
      price,
      website,
    } = await req.json();

    // Anti-spam protection - reject if honeypot filled
    if (website) {
      console.log("Honeypot triggered in checkout:", { website });
      return jsonResponse({ error: "Invalid submission" }, 400);
    }

    // Validate required fields
    const validationError = validateRequired({
      event_id,
      event_title,
      name,
      email,
      price,
    });
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return jsonResponse({ error: "Invalid email format" }, 400);
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      return jsonResponse({ error: "Invalid price" }, 400);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event_title,
              description: `Event registration for ${event_title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        req.headers.get("origin") || "http://localhost:5173"
      }/events/test-event?payment=success`,
      cancel_url: `${
        req.headers.get("origin") || "http://localhost:5173"
      }/events/test-event?payment=cancelled`,
      metadata: {
        event_id,
        event_title,
        name,
        email,
        newsletter_signup: newsletter_signup ? "true" : "false",
      },
      customer_email: email,
    });

    return jsonResponse({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return jsonResponse({ error: "Failed to create checkout session" }, 500);
  }
});
```

### 5. Create Stripe Webhook Handler

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { jsonResponse, handleCors } from "../_shared/utils.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

Deno.serve(async (req): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  let stripeEvent: Stripe.Event;

  try {
    const body = await req.text();
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (stripeEvent.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        stripeEvent.data.object as Stripe.Checkout.Session
      );
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(
        stripeEvent.data.object as Stripe.PaymentIntent
      );
      break;
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return new Response("Success", { status: 200 });
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const supabase = createSupabaseClient();
    const { event_id, event_title, name, email, newsletter_signup } =
      session.metadata || {};

    if (!event_id || !name || !email) {
      console.error("Missing required metadata in checkout session");
      return;
    }

    console.log("Creating registration for:", { event_id, name, email });

    // Create registration record
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert([
        {
          event_id,
          name,
          email,
          payment_method: "online",
          payment_status: "completed",
          newsletter_signup: newsletter_signup === "true",
        },
      ])
      .select()
      .single();

    if (regError) {
      console.error("Failed to create registration:", regError);
      return;
    }

    console.log("Registration created successfully:", registration.id);

    // TODO: Send confirmation email (will be implemented in ADC-05)
  } catch (error) {
    console.error("Error handling checkout completion:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error("Payment failed for intent:", paymentIntent.id);
  // TODO: Handle payment failure notifications
}
```

### 6. Configure Stripe Webhook

In Stripe Dashboard:

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
3. Listen for events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook signing secret to environment variables

**Deploy Edge Functions:**

```bash
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

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

### 8. Add Environment Variables

**For Supabase Edge Functions:**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SB_SECRET_KEY=your_supabase_secret_key
```

**For Netlify Site:**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

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
- `supabase/functions/create-checkout/index.ts` - Stripe checkout session creation
- `supabase/functions/stripe-webhook/index.ts` - Webhook handler for payment events
- `src/routes/events/test-event/+page.svelte` - Updated to pass event title
- Environment variables added via Supabase CLI and Netlify dashboard

## Implementation Notes

- ✅ Completed with redirect-based Stripe Checkout
- 🔄 **Consider migrating to Embedded Checkout** for better branding control (see [Stripe Embedded Checkout docs](https://docs.stripe.com/checkout/embedded/quickstart))
  - Would eliminate redirects and keep users on appletondrawingclub.com
  - Better branding control without needing separate Stripe accounts
  - Same security and PCI compliance as hosted checkout

## TODOs

- [x] Figure out connecting to webhook in local development environment using Stripe CLI

## Next Steps

After completing this task, proceed to **ADC-04** to improve registration success/failure feedback and URL handling.
