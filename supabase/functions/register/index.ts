import { createSupabaseClient } from "../_shared/supabase.ts";
import {
  handleCors,
  isValidEmail,
  jsonResponse,
  validateRequired,
} from "../_shared/utils.ts";
import type {
  RegistrationRequest,
  RegistrationResponse,
} from "../_shared/types.ts";
import { findOrCreateCustomer } from "../_shared/stripe-customer.ts";
import { PostgrestError } from "https://esm.sh/@supabase/postgrest-js@1.21.4/dist/cjs/index.d.ts";

Deno.serve(async (req): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createSupabaseClient();
    const requestData: RegistrationRequest = await req.json();
    const {
      event_id,
      name,
      email,
      quantity,
      payment_method,
      newsletter_signup,
      processing_status,
      website,
    } = requestData;

    // Honeypot validation - reject if filled out
    if (website) {
      console.log("Honeypot triggered:", { website });
      return jsonResponse({ error: "Invalid submission" }, 400);
    }

    // Validate required fields
    const validationError = validateRequired({
      event_id,
      name,
      email,
      quantity,
      payment_method,
    });
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 6) {
      return jsonResponse(
        { error: "Invalid quantity. Please select 1-6 people." },
        400
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return jsonResponse({ error: "Invalid email format" }, 400);
    }

    // Find or create Stripe customer
    const customerId = await findOrCreateCustomer(email, name);

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert([
        {
          event_id,
          name,
          email,
          quantity,
          payment_method,
          payment_status: "pending",
          newsletter_signup: newsletter_signup || false,
          stripe_customer_id: customerId,
          processing_status: processing_status || "completed",
        },
      ])
      .select()
      .single();

    if (regError) {
      console.error("Supabase error:", regError);

      // Handle duplicate registration (if unique constraint exists)
      // TODO: Handle this error code better with a shared constant or typed response
      if (regError.code === "23505") {
        return jsonResponse(
          { error: "You have already registered for this event" },
          400
        );
      }

      // Handle foreign key violation - event doesn't exist
      if (regError.code === "23503") {
        return jsonResponse(
          {
            error: "Event not found. Please check the event ID and try again.",
          },
          400
        );
      }

      throw regError;
    }

    const response: RegistrationResponse = {
      success: true,
      registration: registration,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error("Registration error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
