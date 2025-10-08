import Stripe from "https://esm.sh/stripe@14.21.0";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { handleCors } from "../_shared/utils.ts";
import { sendRegistrationConfirmationEmail } from "../_shared/email-utils.ts";

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
    stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    // Handle the event
    switch (stripeEvent.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripeEvent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(stripeEvent);
        break;
      case "payment_intent.payment_failed":
        handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Return 500 to trigger Stripe retry
    return new Response("Internal server error", { status: 500 });
  }
});

async function handleCheckoutCompleted(stripeEvent: Stripe.Event) {
  const supabase = createSupabaseClient();
  const session = stripeEvent.data.object as Stripe.Checkout.Session;
  const eventId = stripeEvent.id;

  // Check for idempotency - has this event been processed before?
  const { data: existingRegistrations, error: checkError } = await supabase
    .from("registrations")
    .select("id")
    .eq("stripe_event_id", eventId);

  if (checkError) {
    console.error("Error checking for existing registration:", checkError);
    throw checkError;
  }

  if (existingRegistrations && existingRegistrations.length > 0) {
    console.log(`Event ${eventId} already processed, skipping`);
    return;
  }

  const { registration_id, customer_id, donation_amount } =
    session.metadata || {};

  // Get customer ID from session (prefer metadata, fallback to session customer)
  const stripeCustomerId = customer_id || (session.customer as string);

  if (!registration_id || !stripeCustomerId) {
    console.error("Missing required data in checkout session:", {
      registration_id: !!registration_id,
      stripeCustomerId: !!stripeCustomerId,
      sessionId: session.id,
    });
    throw new Error("Missing required registration or customer data");
  }

  console.log("Updating registration:", {
    registration_id,
    stripeCustomerId,
    sessionId: session.id,
  });

  // Update existing pending registration
  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .update({
      payment_status: "completed",
      processing_status: "completed",
      stripe_event_id: eventId,
      stripe_session_id: session.id,
    })
    .eq("id", registration_id)
    .select()
    .single();

  if (regError) {
    console.error("Failed to update registration:", regError);
    throw regError;
  }

  console.log("Registration updated successfully:", registration.id);

  // Send confirmation email for completed payment
  try {
    // Query event data from database with location
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        date,
        time,
        price,
        special_notes,
        location:locations (
          name,
          street_address,
          locality,
          region,
          postal_code
        )
      `
      )
      .eq("id", registration.event_id)
      .single();

    if (eventError) {
      console.error("Failed to fetch event for email:", eventError);
    } else if (eventData && eventData.location) {
      // Send confirmation email
      await sendRegistrationConfirmationEmail({
        registration: {
          id: registration.id,
          name: registration.name,
          email: registration.email,
          quantity: registration.quantity,
          payment_method: registration.payment_method,
          newsletter_signup: registration.newsletter_signup || false,
        },
        event: {
          id: eventData.id,
          title: eventData.title,
          date: eventData.date,
          time: eventData.time,
          location: {
            name: eventData.location.name,
            address: `${eventData.location.street_address}, ${eventData.location.locality}, ${eventData.location.region} ${eventData.location.postal_code}`,
          },
          price: eventData.price,
          special_notes: eventData.special_notes,
        },
        donation_amount: donation_amount
          ? parseInt(donation_amount)
          : undefined,
      });
      console.log("Confirmation email sent for registration:", registration.id);
    }
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
    // Don't fail the webhook if email fails - just log it
  }
}

function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error("Payment failed for intent:", paymentIntent.id);
  // Payment failures are handled by Stripe's embedded checkout UI
  // Registration remains in pending state for potential retry
}

// TODO: This has _not_ been tested with actual refunds yet, only generated by agent.
// Need to test in staging environment
async function handleChargeRefunded(stripeEvent: Stripe.Event) {
  const supabase = createSupabaseClient();
  const charge = stripeEvent.data.object as Stripe.Charge;
  const refundId = stripeEvent.id;

  // Get the payment intent to find the associated checkout session
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.error("No payment intent found for refunded charge:", charge.id);
    return;
  }

  console.log("Processing refund for charge:", {
    chargeId: charge.id,
    paymentIntentId,
    amount: charge.amount_refunded,
    refundId,
  });

  // Find the registration by payment intent (via checkout session)
  // First, get the checkout session from Stripe
  let sessionId: string | null = null;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // Get the checkout session ID from the payment intent metadata or related checkout session
    const checkoutSessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (checkoutSessions.data.length > 0) {
      sessionId = checkoutSessions.data[0].id;
    }
  } catch (error) {
    console.error(
      "Failed to retrieve payment intent or checkout session:",
      error
    );
  }

  // Try to find registration by session ID first, then fall back to customer email
  let registrationQuery = supabase
    .from("registrations")
    .select("*")
    .eq("payment_status", "completed");

  if (sessionId) {
    registrationQuery = registrationQuery.eq("stripe_session_id", sessionId);
  } else {
    // Fall back to finding by customer email and recent timeframe
    const customerEmail = charge.billing_details?.email;
    if (customerEmail) {
      registrationQuery = registrationQuery
        .eq("email", customerEmail)
        .order("created_at", { ascending: false })
        .limit(1);
    } else {
      console.error(
        "Cannot find registration: no session ID or customer email"
      );
      return;
    }
  }

  const { data: registrations, error: findError } = await registrationQuery;

  if (findError) {
    console.error("Error finding registration for refund:", findError);
    throw findError;
  }

  if (!registrations || registrations.length === 0) {
    console.warn("No registration found for refunded charge:", charge.id);
    return;
  }

  const registration = registrations[0];

  // Update registration to refunded status
  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      payment_status: "refunded",
      refunded_at: new Date().toISOString(),
      refund_amount: charge.amount_refunded / 100, // Convert cents to dollars
      stripe_refund_id: refundId,
    })
    .eq("id", registration.id);

  if (updateError) {
    console.error("Failed to update registration to refunded:", updateError);
    throw updateError;
  }

  console.log("Registration marked as refunded:", registration.id);
}
