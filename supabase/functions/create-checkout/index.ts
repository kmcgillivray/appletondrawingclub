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

    // Find or create Stripe customer
    const customerId = await findOrCreateCustomer(email, name);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${event_title}`,
              description: `Event registration for ${event_title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
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
        newsletter_signup: newsletter_signup ? "true" : "false",
        customer_id: customerId,
      },
      customer: customerId,
    });

    return jsonResponse({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return jsonResponse({ error: "Failed to create checkout session" }, 500);
  }
});
