export async function loadClients(
  supabase,
  state
) {

  const panel =
    document.getElementById("clients");

  if (!panel) return;

  const { data, error } =
    await supabase
      .from("clients")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {

    console.error(error);

    panel.innerHTML =
      "Fout bij laden";

    return;
  }

  panel.innerHTML = `

    <div class="topbar">

      <h2>
        Cliënten
      </h2>

      <button id="newClientBtn">
        + Nieuwe cliënt
      </button>

    </div>

    <div class="cards">

      ${data.map(client => `

        <div
          class="card client-card"
          data-id="${client.id}"
        >

          <h3>
            ${client.full_name || "Naamloos"}
          </h3>

          <p>
            ${client.email || ""}
          </p>

          <p>
            ${client.phone || ""}
          </p>

          <div class="
            status-badge
            status-${client.status}
          ">
            ${client.status}
          </div>

        </div>

      `).join("")}

    </div>

  `;

  document
    .getElementById(
      "newClientBtn"
    )
    .addEventListener(
      "click",
      () => renderNewClientForm(
        supabase,
        state
      )
    );
}

async function renderNewClientForm(
  supabase,
  state
) {

  const panel =
    document.getElementById(
      "clients"
    );

  panel.innerHTML = `

    <div class="card">

      <h2>
        Nieuwe cliënt
      </h2>

      <input
        id="clientName"
        placeholder="Naam"
      >

      <input
        id="clientEmail"
        placeholder="E-mail"
      >

      <input
        id="clientPhone"
        placeholder="Telefoon"
      >

      <button id="saveClientBtn">
        Opslaan
      </button>

    </div>

  `;

  document
    .getElementById(
      "saveClientBtn"
    )
    .addEventListener(
      "click",
      async () => {

        const full_name =
          document.getElementById(
            "clientName"
          ).value;

        const email =
          document.getElementById(
            "clientEmail"
          ).value;

        const phone =
          document.getElementById(
            "clientPhone"
          ).value;

        const { error } =
          await supabase
            .from("clients")
            .insert({
              full_name,
              email,
              phone,

              created_by:
                state.session.user.id
            });

        if (error) {

          console.error(error);

          alert(
            "Opslaan mislukt"
          );

          return;
        }

        loadClients(
          supabase,
          state
        );
      }
    );
}