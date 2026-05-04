export async function checkSession(supabase, state) {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "./index.html";
    return false;
  }

  state.session = data.session;
  return true;
}
export async function loadProfile(supabase, state) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", state.session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", error);
      return false;
    }

    if (!data) {
      console.error("Geen profiel gevonden");
      return false;
    }

    if (!data.approved) {
      alert("Nog niet goedgekeurd");
      window.location.href = "./index.html";
      return false;
    }

    state.profile = data;

    const el = document.getElementById("userMeta");
    if (el) {
      el.textContent = `${data.email} (${data.rol})`;
    }

    return true;

  } catch (err) {
    console.error("loadProfile crash:", err);
    return false;
  }
}