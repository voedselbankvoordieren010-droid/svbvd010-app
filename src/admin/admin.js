const {
  data: { user }
} = await supabase.auth.getUser();

const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

if (profile.role !== "admin") {
  window.location.href = "/";
}
