import Stripe from "https://esm.sh/stripe@14.21.0";
import {
  jsonResponse,
  handleCors,
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

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    // Validate required fields
    const validationError = validateRequired({ session_id: sessionId });
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId!, {
      expand: ['line_items', 'customer']
    });

    // Return only the data we need for the client
    return jsonResponse({
      session: {
        id: session.id,
        status: session.status,
        amount_total: session.amount_total,
        metadata: session.metadata,
        customer_email: session.customer_email,
        payment_status: session.payment_status,
        created: session.created,
      }
    });
  } catch (error: any) {
    console.error("Get checkout session error:", error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return jsonResponse({ error: "Invalid session ID or session not found" }, 404);
    }
    
    return jsonResponse({ error: "Failed to retrieve checkout session" }, 500);
  }
});