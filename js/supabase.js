import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8"
);