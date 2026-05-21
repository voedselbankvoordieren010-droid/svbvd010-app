export async function loadClients(
  supabase,
  state
) {

  console.log(
    "LOAD CLIENTS START"
  );

  const container =
    document.getElementById(
      "clients"
    );

  if (!container) return;

  container.innerHTML =
    "<p>Laden...</p>";

  const {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*")
    .order(
      "created_at",
      { ascending: false }
    );

  console.log(
    "CLIENTS DATA:",
    data
  );

  console.log(
    "CLIENTS ERROR:",
    error
  );

  if (error) {

    container.innerHTML = `
      <p>
        Fout bij laden cliënten
      </p>
    `;

    return;
  }

  if (!data.length) {

    container.innerHTML = `
      <p>
        Geen cliënten gevonden
      </p>
    `;

    return;
  }

  container.innerHTML =
    data.map(client => `

      <div class="client-card">

        <h3>
          ${client.full_name || ""}
        </h3>

        <p>
          📧 ${client.email || "-"}
        </p>

        <p>
          📞 ${client.phone || "-"}
        </p>

        <p>
          📍 ${client.city || "-"}
        </p>

        <p>
          Status:
          <strong>
            ${client.status || "-"}
          </strong>
        </p>

        <p>
          ${client.notes || ""}
        </p>

      </div>

    `).join("");
}