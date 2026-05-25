import {
  showClientDetails
} from "./details/index.js";

import {
  initClientModal
} from "./modal";

import {
  initClientSearch
} from "./search";

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

  if (!container) {
    return;
  }

  container.innerHTML = `
    <p>Laden...</p>
  `;

  const {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
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

    console.error(error);

    container.innerHTML = `

      <p>
        Fout bij laden cliënten
      </p>

    `;

    return;
  }

  if (!data?.length) {

    container.innerHTML = `

      <p>
        Geen cliënten gevonden
      </p>

    `;

    return;
  }

  container.innerHTML = `

    <div class="clients-header">

      <div>

        <h1>
          Cliënten
        </h1>

        <input
          id="clientSearch"
          placeholder="Zoek cliënt..."
        >

      </div>

      <button
        id="newClientBtn"
        class="btn"
      >
        + Nieuwe cliënt
      </button>

    </div>

    <div class="client-grid">

      ${data.map(client => {

        const safeStatus =
          client.status || "nieuw";

        return `

          <div
            class="client-card"
            data-id="${client.id}"
          >

            <h3>
              ${client.full_name || ""}
            </h3>

            <p>
              ${client.email || "-"}
            </p>

            <p>
              ${client.phone || "-"}
            </p>

            <div
              class="
                status-badge
                ${safeStatus}
              "
            >
              ${safeStatus}
            </div>

          </div>

        `;
      }).join("")}

    </div>
  `;

  document
    .querySelectorAll(
      ".client-card"
    )
    .forEach(card => {

      card.onclick =
        () => {

          const client =
            data.find(
              c =>
                c.id ===
                card.dataset.id
            );

          if (!client) {
            return;
          }

          showClientDetails(
            client,
            supabase
          );
        };
    });

  initClientSearch();

  initClientModal(
    supabase,
    state
  );
}