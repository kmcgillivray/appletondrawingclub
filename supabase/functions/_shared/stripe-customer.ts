import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

/**
 * Find existing Stripe customer by email or create a new one
 * @param email Customer email address
 * @param name Customer full name
 * @returns Stripe customer ID
 * @throws Error if customer creation/lookup fails
 */
export async function findOrCreateCustomer(
  email: string,
  name: string,
): Promise<string> {
  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const existingCustomer = existingCustomers.data[0];
      console.log(`Found existing customer: ${existingCustomer.id} for email: ${email}`);
      return existingCustomer.id;
    }

    // If no existing customer, create a new one
    console.log(`Creating new customer for email: ${email}`);
    const newCustomer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        source: "appleton-drawing-club",
        created_via: "registration",
      },
    });

    console.log(`Created new customer: ${newCustomer.id} for email: ${email}`);
    return newCustomer.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to find or create Stripe customer:", {
      email,
      name,
      error: errorMessage,
    });
    throw new Error(`Customer creation failed: ${errorMessage}`);
  }
}