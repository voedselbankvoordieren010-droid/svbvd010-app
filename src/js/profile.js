import { supabase } from "./supabase";

export async function ensureProfile(user) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (existing) {
    return existing;
  }

  const profile = {
    id: user.id,
    email: user.email,
    full_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "",
    role: "admin"
  };

  const { error } = await supabase
    .from("profiles")
    .insert(profile);

  if (error) {
    console.error(error);
  }

  return profile;
}
export async function getProfile(userId) {

  const { data, error } = await supabase

    .from("profiles")

    .select("*")

    .eq("id", userId)

    .single();

  if (error) {

    console.error(error);

    return null;
  }

  return data;
}