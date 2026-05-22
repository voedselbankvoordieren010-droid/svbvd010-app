export async function loadOwnClientProfile(supabase, profile) {
  const clientsPanel = document.getElementById("chatList");

  if (!clientsPanel) {
    return;
  }

  // 1. Veiligere check met '?.', voor het geval profile zelf null/undefined is
  if (!profile?.client_id) {
    clientsPanel.innerHTML = `<p>Geen cliënt gekoppeld</p>`;
    return;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", profile.client_id)
    .maybeSingle(); // 2. 'maybeSingle' voorkomt een crash als de ID niet bestaat

  // 3. Betere foutafhandeling: toon ook als er simpelweg geen dossier is gevonden
  if (error || !data) {
    console.error("Supabase fout of leeg resultaat:", error);
    clientsPanel.innerHTML = `<p>Fout bij laden dossier (bestaat niet of geen toegang)</p>`;
    return;
  }

  // 4. Data veilig tonen
  clientsPanel.innerHTML = `
    <div class="client-card">
      <h1>Mijn dossier</h1>
      <h2>${data.full_name || "Naam onbekend"}</h2>
      <p>📧 ${data.email || "-"}</p>
      <p>📞 ${data.phone || "-"}</p>
      <p>📍 ${data.address || "-"}</p>
      <p>Status: ${data.status || "-"}</p>
    </div>
  `;
}
