import {
  createClient
} from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://qybobqolknvovigickpy.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8";

export const supabase =
  createClient(

    SUPABASE_URL,
    SUPABASE_KEY,

    {

      auth: {

        persistSession: true,

        autoRefreshToken: true,

        detectSessionInUrl: true
      }
    }
  );