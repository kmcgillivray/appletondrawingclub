import Stripe from "https://esm.sh/stripe@14.21.0";
import {
  jsonResponse,
  handleCors,
  isValidEmail,
  validateRequired,
} from "../_shared/utils.ts";
import { findOrCreateCustomer } from "../_shared/stripe-customer.ts";

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
      quantity,
      registration_id,
      website,
      donation_amount,
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
      quantity,
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

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 6) {
      return jsonResponse(
        { error: "Invalid quantity. Please select 1-6 people." },
        400
      );
    }

    // Find or create Stripe customer
    const customerId = await findOrCreateCustomer(email, name);

    // Build line items array
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${event_title}`,
            description: `Event registration for ${event_title}`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: quantity,
      },
    ];

    // Add donation line item if donation amount is provided
    if (donation_amount && donation_amount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Additional Wildlife Rescue Donation",
            description: "Optional donation to support raptor education and wildlife rescue",
          },
          unit_amount: Math.round(donation_amount * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      payment_intent_data: {
        statement_descriptor: "APPLETON DRAW CLUB",
      },
      return_url: `${
        req.headers.get("origin") || "http://localhost:5173"
      }/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        event_id,
        event_title,
        name,
        email,
        quantity: quantity.toString(),
        newsletter_signup: newsletter_signup ? "true" : "false",
        customer_id: customerId,
        registration_id: registration_id || "",
        donation_amount: donation_amount ? donation_amount.toString() : "0",
      },
      customer: customerId,
    });

    return jsonResponse({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return jsonResponse({ error: "Failed to create checkout session" }, 500);
  }
});
