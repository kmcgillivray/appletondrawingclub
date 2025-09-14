import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "./database.types.ts";

export const createSupabaseClient = () => {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SECRET_KEY") ?? ""
  );
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
