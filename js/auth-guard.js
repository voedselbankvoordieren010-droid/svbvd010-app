import { supabase }
  from "./supabase.js";

/**
 * REQUIRE AUTH
 */

export async function requireAuth({

  requireAdmin = false,

  requireRoles = []

} = {}) {

  try {

    // SESSION
    const {
      data,
      error
    } = await supabase
      .auth
      .getSession();

    if (
      error ||
      !data?.session
    ) {

      console.warn(
        "GEEN SESSION"
      );

      return null;
    }

    const user =
      data.session.user;

    // PROFILE
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

    if (profileError) {

      console.error(
        "PROFILE ERROR:",
        profileError
      );

      return null;
    }

    // GEEN PROFIEL
    if (!profile) {

      console.warn(
        "GEEN PROFIEL"
      );

      return null;
    }

    // ROLE VALIDATIE
    const validRoles = [
  "admin",
  "hulpverlener",
  "intake",
  "vrijwilliger",
  "client"
];

    if (
      !validRoles.includes(
        profile.role
      )
    ) {

      console.warn(
        "ONGELDIGE ROLE:",
        profile.role
      );

      return null;
    }

    // APPROVED CHECK
    if (!profile.approved) {

      console.warn(
        "NIET GOEDGEKEURD"
      );

      return null;
    }

    // ADMIN CHECK
    if (
      requireAdmin &&
      profile.role !== "admin"
    ) {

      console.warn(
        "GEEN ADMIN"
      );

      return null;
    }

    // ROLE CHECK
    if (
      requireRoles.length > 0 &&
      !requireRoles.includes(
        profile.role
      )
    ) {

      console.warn(
        "GEEN TOEGANG"
      );

      return null;
    }

    return {

      user,

      profile,

      session:
        data.session
    };

  } catch (err) {

    console.error(
      "AUTH CRASH:",
      err
    );

    return null;
  }
}
