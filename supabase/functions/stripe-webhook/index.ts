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

  const { registration_id, customer_id } = session.metadata || {};

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
