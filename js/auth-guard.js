import { supabase }
  from "./supabase.js";

/**
 * Require logged-in user
 */

export async function requireAuth({

  requireAdmin = false

} = {}) {

  // kleine delay voor OAuth
  await new Promise(
    r => setTimeout(r, 300)
  );

  // session ophalen
  const {
    data,
    error
  } = await supabase.auth.getSession();

  console.log(
    "AUTH SESSION:",
    data
  );

  if (
    error ||
    !data?.session
  ) {

    console.error(
      "GEEN SESSION"
    );

    return null;
  }

  const user =
    data.session.user;

  // profiel ophalen
  const {
    data: profile,
    error: profileError
  } = await supabase
    .from("profiles")
    .select("*")
    .eq(
      "id",
      user.id
    )
    .maybeSingle();

  console.log(
    "PROFILE:",
    profile
  );

  console.log(
    "PROFILE ERROR:",
    profileError
  );

  if (profileError) {

    console.error(
      profileError
    );

    return null;
  }

  // profiel bestaat niet
  if (!profile) {

    console.warn(
      "GEEN PROFIEL"
    );

    return null;
  }

  // niet goedgekeurd
  if (!profile.approved) {

    console.warn(
      "NIET GOEDGEKEURD"
    );

    return null;
  }

  // admin check
  if (
    requireAdmin &&
    profile.role !== "admin"
  ) {

    console.warn(
      "GEEN ADMIN"
    );

    return null;
  }

  return profile;
}