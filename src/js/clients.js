import { supabase } from "./supabase";

export async function createClient(
  user,
  profile,
  clientData
) {

  const { data, error } =
    await supabase

      .from("clients")

      .insert([{

        full_name:
          clientData.full_name,

        phone:
          clientData.phone,

        email:
          clientData.email,

        notes:
          clientData.notes,

        status: "nieuw",

        organization_id:
          profile.organization_id,

        created_by:
          profile.id,

        assigned_to:
          profile.id

      }])

      .select()

      .single();

  if (error) {

    console.error(error);
  }

  return data;
}

export async function getClients(
  organizationId
) {

  const { data, error } =
    await supabase

      .from("clients")

      .select("*")

      .eq(
        "organization_id",
        organizationId
      )

      .order("created_at", {
        ascending: false
      });

  if (error) {

    console.error(error);

    return [];
  }

  return data;
}

export async function updateClientStatus(
  clientId,
  status
) {

  const { data, error } =
    await supabase

      .from("clients")

      .update({
        status: status
      })

      .eq("id", clientId)

      .select()

      .single();

  if (error) {

    console.error(error);
  }

  return data;
}

export async function getClientStats(
  organizationId
) {

  const { data, error } =
    await supabase

      .from("clients")

      .select("*")

      .eq(
        "organization_id",
        organizationId
      );

  if (error) {

    console.error(error);

    return null;
  }

  return {

    nieuw:
      data.filter(
        c => c.status === "nieuw"
      ).length,

    intake:
      data.filter(
        c => c.status === "intake"
      ).length,

    behandeling:
      data.filter(
        c => c.status === "in behandeling"
      ).length,

    spoed:
      data.filter(
        c => c.status === "spoed"
      ).length,

    afgerond:
      data.filter(
        c => c.status === "afgerond"
      ).length
  };
}