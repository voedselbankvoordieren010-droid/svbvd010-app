import { createClient }
  from "@supabase/supabase-js";

const supabaseUrl =
  "https://qybobqolknvovigickpy.supabase.co";

const supabaseKey =
  "JOUW_ANON_KEY";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {

        persistSession: true,

        autoRefreshToken: true,

        detectSessionInUrl: true

      }
    }
  );