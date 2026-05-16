import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co/rest/v1/",
  "sb_publishable_JGO1NZI5S32Nq_2X48AGiw_XxAJyjkg"
);

async function loadUsers() {
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