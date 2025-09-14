import { getAllEvents, getEventById } from "$lib/server/events";
import { error } from "@sveltejs/kit";

// Enable prerendering for all event pages
export const prerender = true;

/**
 * Generates static routes for all events at build time
 * SvelteKit calls this function to determine which [slug] values to pre-render
 */
export async function entries() {
  try {
    const events = await getAllEvents();

    // Return array of params for each event
    return events.map((event) => ({
      slug: event.id,
    }));
  } catch (err) {
    console.error("Failed to generate event entries:", err);
    throw error(500, "Failed to generate event routes");
  }
}

/**
 * Loads event data for a specific slug at build time
 * This runs once per event during static generation
 */
export async function load({ params }) {
  try {
    const event = await getEventById(params.slug);

    if (!event) {
      throw error(404, `Event '${params.slug}' not found`);
    }

    return {
      event,
    };
  } catch (err) {
    // Re-throw SvelteKit errors (like 404)
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error(`Failed to load event '${params.slug}':`, err);
    throw error(500, "Failed to load event data");
  }
}
