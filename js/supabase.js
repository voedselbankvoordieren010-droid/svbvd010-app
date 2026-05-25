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