import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8"
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
    <div style="padding:15px;border:1px solid #ccc;margin:10px;">

      <strong>${user.email}</strong><br><br>

      Rol:
      <select id="role-${user.id}">
        <option value="client" ${user.role === "client" ? "selected" : ""}>client</option>
        <option value="vrijwilliger" ${user.role === "vrijwilliger" ? "selected" : ""}>vrijwilliger</option>
        <option value="hulpverlener" ${user.role === "hulpverlener" ? "selected" : ""}>hulpverlener</option>
        <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
      </select>

      <br><br>

      Approved:
      <input
        type="checkbox"
        id="approved-${user.id}"
        ${user.approved ? "checked" : ""}
      />

      <br><br>

      <button onclick="saveUser('${user.id}')">
        Opslaan
      </button>

    </div>
  `).join("");
}

async function checkAdmin() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    document.body.innerHTML = "<h1>Geen toegang</h1>";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile.role !== "admin") {
    document.body.innerHTML = "<h1>Geen toegang</h1>";
    return;
  }

  loadUsers();
}

window.saveUser = async function(id) {

  const role = document.getElementById(`role-${id}`).value;

  const approved = document.getElementById(`approved-${id}`).checked;

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      approved
    })
    .eq("id", id);

  if (error) {
    alert("Fout bij opslaan");
    console.error(error);
    return;
  }

  alert("Gebruiker opgeslagen");
};

checkAdmin();