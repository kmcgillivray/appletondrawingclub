import { createClient } from "@supabase/supabase-js";
import type { Event } from "$lib/types.js";
import { SUPABASE_PRIVATE_KEY, SUPABASE_URL } from "$env/static/private";
import { type Database } from "$lib/database.types";

// Server-side only utility for fetching events from database during build time
// Uses service role key for elevated permissions

if (!SUPABASE_URL || !SUPABASE_PRIVATE_KEY) {
  throw new Error(
    "Missing required environment variables for Supabase connection"
  );
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

/**
 * Fetches all events from the database with joined location data
 * Transforms the normalized database schema back to the Event interface format
 * @returns {Promise<Event[]>} Array of events in frontend format
 */
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      location:locations (
        name,
        street_address,
        locality,
        region,
        postal_code
      )
    `
    )
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to fetch events from database:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform database format to Event interface format
  return data.map(
    (dbEvent): Event => ({
      id: dbEvent.id,
      title: dbEvent.title,
      date: dbEvent.date,
      time: dbEvent.time,
      doors_open: dbEvent.doors_open || undefined,
      location: {
        name: dbEvent.location.name,
        address: {
          streetAddress: dbEvent.location.street_address,
          addressLocality: dbEvent.location.locality,
          addressRegion: dbEvent.location.region,
          postalCode: dbEvent.location.postal_code,
        },
      },
      model: dbEvent.model || undefined,
      session_leader: dbEvent.session_leader || undefined,
      instructor: dbEvent.instructor || undefined,
      price: dbEvent.price,
      capacity: dbEvent.capacity || undefined,
      event_type: dbEvent.event_type as Event["event_type"],
      status: (dbEvent.status as Event["status"]) || "registration_open",
      special_notes: dbEvent.special_notes || undefined,
      summary: dbEvent.summary,
      description: dbEvent.description,
      image_url: dbEvent.image_url || undefined,
      url: dbEvent.url || undefined,
    })
  );
}

/**
 * Fetches a single event by ID
 * @param {string} eventId - The event ID to fetch
 * @returns {Promise<Event|null>} The event if found, null otherwise
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  // TODO: Update this to query single event from database instead of fetching all and filtering
  const events = await getAllEvents();
  return events.find((eventData) => eventData.id === eventId) || null;
}
