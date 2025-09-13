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
import { sendRegistrationConfirmationEmail } from "../_shared/email-utils.ts";
import { syncToNewsletter } from "../_shared/buttondown.ts";

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

    // Determine processing status - door payments are completed immediately
    const processingStatus =
      payment_method === "door" ? "completed" : "pending";

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
          processing_status: processingStatus,
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

    // Send confirmation email for completed registrations (pay-at-door)
    if (registration.processing_status === "completed") {
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
          .eq("id", event_id)
          .single();

        if (eventError) {
          console.error("Failed to fetch event for email:", eventError);
        } else if (eventData && eventData.location) {
          // TODO: Fix typing returns from Supabase queries
          const location = eventData.location as any;
          // Send confirmation email
          await sendRegistrationConfirmationEmail({
            registration: {
              id: registration.id,
              name: registration.name,
              email: registration.email,
              quantity: registration.quantity,
              payment_method: registration.payment_method,
              newsletter_signup: registration.newsletter_signup,
            },
            event: {
              id: eventData.id,
              title: eventData.title,
              date: eventData.date,
              time: eventData.time,
              location: {
                name: location.name,
                address: `${location.street_address}, ${location.locality}, ${location.region} ${location.postal_code}`,
              },
              price: eventData.price,
              special_notes: eventData.special_notes,
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the registration if email fails - just log it
      }
    }

    // Sync to newsletter if user opted in
    if (registration.newsletter_signup) {
      try {
        await syncToNewsletter(registration.email);
      } catch (newsletterError) {
        console.error("Newsletter sync failed:", newsletterError);
        // Don't fail the registration if newsletter sync fails - just log it
        // Most errors are logged inside syncToNewsletter function, so this is just a catch-all
      }
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
