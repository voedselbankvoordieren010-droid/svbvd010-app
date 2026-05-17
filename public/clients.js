import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://qybobqolknvovigickpy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Ym9icW9sa252b3ZpZ2lja3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ5NDEsImV4cCI6MjA5MDU0MDk0MX0.UvZjGttYTUAZnr49m3AUeBoM1nfUHWykEhSnsh8iVa8"
);

async function loadClients() {

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const clientsDiv = document.getElementById("clients");

  clientsDiv.innerHTML = data.map(client => `
    <div style="border:1px solid #ccc;padding:15px;margin:10px;">

      <strong>${client.full_name || "-"}</strong><br>

      Telefoon: ${client.phone || "-"}<br>

      Email: ${client.email || "-"}<br>

      Status: ${client.status || "-"}<br>

    </div>
  `).join("");
}

window.createClient = async function() {

  const full_name = document.getElementById("full_name").value;

  const phone = document.getElementById("phone").value;

  const email = document.getElementById("email").value;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("clients")
    .insert([{
      full_name,
      phone,
      email,
      created_by: user.id
    }]);

  if (error) {
    console.error(error);
    alert("Fout bij toevoegen");
    return;
  }

  alert("Cliënt toegevoegd");

  loadClients();
};

loadClients();