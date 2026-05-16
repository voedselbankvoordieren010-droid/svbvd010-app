import { supabase } from "./supabase";

export async function getUsers() {

  const { data, error } = await supabase

    .from("profiles")

    .select("*");

  if (error) {

    console.error(error);

    return [];
  }

  return data;
}
export async function getPendingUsers() {

  const { data, error } = await supabase

    .from("profiles")

    .select("*")

    .eq("approved", false);

  if (error) {

    console.error(error);

    return [];
  }

  return data;
}
export async function approveUser(
  userId
) {

  const { data, error } = await supabase

    .from("profiles")

    .update({

      approved: true,

      role: "hulpverlener"

    })

    .eq("id", userId)

    .select()

    .single();

  if (error) {

    console.error(error);
  }

  return data;
}