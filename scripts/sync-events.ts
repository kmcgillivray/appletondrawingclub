// Read all markdown in src/events and sync to supabase
// Run this script with `npx dotenvx run -f .env.local -- ts-node scripts/sync-events.ts`
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PRIVATE_KEY = process.env.SUPABASE_PRIVATE_KEY;

if (!SUPABASE_URL || !SUPABASE_PRIVATE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_PRIVATE_KEY in environment variables"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

// Define the schema for event frontmatter validation
const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  date: z.string().min(1), // YYYY-MM-DD
  time: z.string().min(1), // HH:MM
  doors_open: z.string().optional(),
  model: z.string().optional(),
  session_leader: z.string().optional(),
  instructor: z.string().optional(),
  price: z.number().min(0),
  capacity: z.number().min(1).nullable().optional(),
  event_type: z.enum([
    "figure_drawing",
    "portrait",
    "workshop",
    "special_event",
  ]),
  status: z.enum(["registration_open", "completed", "coming_soon"]),
  special_notes: z.string().optional(),
  summary: z.string().min(1).max(300),
  description: z.string().min(1),
  image_url: z.url().optional(),
  url: z.url().optional(),
  location_id: z.string(), // Reference to locations table
});

// Directory containing event markdown files
const eventsDir = path.join(process.cwd(), "src", "events");

async function syncEvents() {
  const files = fs
    .readdirSync(eventsDir)
    .filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(eventsDir, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);
    const id = file.replace(/\.md$/, "");
    // Validate frontmatter
    const parseResult = eventSchema.safeParse({
      id,
      ...frontmatter,
      description: content,
    });
    if (!parseResult.success) {
      console.error(
        `Validation error in ${file}:`,
        z.treeifyError(parseResult.error)
      );
      continue;
    }
    const eventData = parseResult.data;

    // Check if event already exists (by id)
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventData.id)
      .limit(1)
      .single();

    if (fetchError) {
      console.error(`Error fetching existing events for ${file}:`, fetchError);
    }

    if (existingEvent) {
      // Update existing event
      const { error: updateError } = await supabase
        .from("events")
        .update({
          ...eventData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        console.error(`Error updating event ${id} from ${file}:`, updateError);
      } else {
        console.log(`Updated event ${id} from ${file}`);
      }
    } else {
      // Insert new event
      const { error: insertError } = await supabase.from("events").insert([
        {
          ...eventData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error(`Error inserting new event from ${file}:`, insertError);
      } else {
        console.log(`Inserted new event from ${file}`);
      }
    }
  }
}

syncEvents().catch((error) => {
  console.error("Error syncing events:", error);
  process.exit(1);
});
