import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8"
);

async function checkAdmin() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile.role !== "admin") {
    window.location.href = "/";
    return;
  }

  checkAdmin();
}
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8"
);

async function loadUsers(); {
  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  const usersDiv = document.getElementById("users");

  usersDiv.innerHTML = data.map(user => `
    <div style="padding:10px;border:1px solid #ccc;margin:10px;">
      <strong>${user.email}</strong><br>
      Rol: ${user.role}<br>
      Approved: ${user.approved}
    </div>
  `).join("");
}

loadUsers();