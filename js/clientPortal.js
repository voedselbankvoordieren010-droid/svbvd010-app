export async function loadOwnClientProfile(
  supabase,
  profile
) {

  const clientsPanel =
    document.getElementById(
      "clients"
    );

  if (!clientsPanel) {
    return;
  }

  if (!profile.client_id) {

    clientsPanel.innerHTML = `
      <p>
        Geen cliënt gekoppeld
      </p>
    `;

    return;
  }

  const {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*")
    .eq(
      "id",
      profile.client_id
    )
    .single();

  if (error) {

    console.error(error);

    clientsPanel.innerHTML = `
      <p>
        Fout bij laden dossier
      </p>
    `;

    return;
  }

  clientsPanel.innerHTML = `

    <div class="client-card">

      <h1>
        Mijn dossier
      </h1>

      <h2>
        ${data.full_name || ""}
      </h2>

      <p>
        📧 ${data.email || "-"}
      </p>

      <p>
        📞 ${data.phone || "-"}
      </p>

      <p>
        📍 ${data.address || "-"}
      </p>

      <p>
        Status:
        ${data.status || "-"}
      </p>

    </div>
  `;
}

