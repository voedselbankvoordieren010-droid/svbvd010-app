import { supabase } from "./supabase";

export async function createAnimal(animalData) {

  const { data, error } = await supabase

    .from("animals")

    .insert([animalData])

    .select()

    .single();

  if (error) {

    console.error(error);

    return null;
  }

  return data;
}

export async function getAnimals(clientId) {

  const { data, error } = await supabase

    .from("animals")

    .select("*")

    .eq("client_id", clientId)

    .eq("is_active", true)

    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    return [];
  }

  return data;
}

export async function updateAnimal(
  animalId,
  updates
) {

  const { data, error } = await supabase

    .from("animals")

    .update(updates)

    .eq("id", animalId)

    .select()

    .single();

  if (error) {

    console.error(error);

    return null;
  }

  return data;
}