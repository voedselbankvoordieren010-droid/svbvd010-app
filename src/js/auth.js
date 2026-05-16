import { supabase } from "./supabase";

export async function login() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) {
    console.error("Login fout:", error.message);
  }
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}

export async function getSession() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}