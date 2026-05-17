export async function getSession() {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("approved, role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile?.approved) {

    await supabase.auth.signOut();

    alert("Je account wacht nog op goedkeuring.");

    return null;
  }

  return session;
}