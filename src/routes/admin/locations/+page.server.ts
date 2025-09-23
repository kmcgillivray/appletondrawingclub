import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PRIVATE_KEY } from "$env/static/private";

export const load = async () => {
  // Use service role key - server only!
  const supabase = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

  const { data: locations, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching locations:", error);
    return { locations: [] };
  }

  return { locations };
};
