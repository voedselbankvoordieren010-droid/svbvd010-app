import { supabase } from "./supabase-config.js";

/**
 * Require a logged-in and approved user.
 * @param {Object} options
 * @param {boolean} options.requireAdmin
 */
export async function requireAuth({ requireAdmin = false } = {}) {
  // ⏳ wacht even voor OAuth redirect (heel belangrijk)
  await new Promise(r => setTimeout(r, 400));

  // 🔑 session ophalen
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session error:", sessionError);
    window.location.replace("./index.html");
    throw new Error("Session fout");
  }

  if (!sessionData?.session) {
    console.warn("Geen sessie gevonden");
    window.location.replace("./index.html");
    throw new Error("Niet ingelogd");
  }

  const user = sessionData.session.user;
  const userId = user.id;

  console.log("AUTH USER:", userId);

  // 👤 profiel ophalen (met juiste filter!)
  const { data: profile, error } = await supabase
    .from("users")
    .select("id, email, rol, approved")
    .eq("auth_id", userId)
    .maybeSingle();

  console.log("PROFILE:", profile);

  // ❗ geen profiel → NIET direct crashen, maar netjes afhandelen
  if (error) {
    console.error("Profile error:", error);
  }

  if (!profile) {
    // 👉 hier NIET redirect loop veroorzaken
    window.location.replace("./geen-toegang.html");
    throw new Error("Geen profiel gevonden voor deze gebruiker");
  }

  // 🚫 niet goedgekeurd
  if (!profile.approved) {
    window.location.replace("./geen-toegang.html");
    throw new Error("Gebruiker niet goedgekeurd");
  }

  // 🔐 admin check
  if (requireAdmin && profile.rol !== "admin") {
    window.location.replace("./geen-toegang.html");
    throw new Error("Geen adminrechten");
  }

  // ✅ alles goed
  return profile;
}