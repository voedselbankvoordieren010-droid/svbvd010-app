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
  state,
  chat = null
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

            ${chat ? `
              <div class="client-card-actions">
                <button
                  class="btn chat-client-btn"
                  data-client-id="${client.id}"
                  data-client-name="${client.full_name || client.email || "Cliënt"}"
                >
                  Chat met deze cliënt
                </button>
              </div>
            ` : ""}

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

  document
    .querySelectorAll(
      ".chat-client-btn"
    )
    .forEach(btn => {
      btn.onclick = async event => {
        event.stopPropagation();

        const clientId = btn.dataset.clientId;
        const clientName = btn.dataset.clientName;

        if (!chat || !chat.openConversationForClient) {
          alert("Chat is niet beschikbaar.");
          return;
        }

        await chat.openConversationForClient(
          clientId,
          clientName
        );

        const chatTab = document.querySelector(
          '[data-tab="chat"]'
        );

        if (chatTab) {
          chatTab.click();
        }
        if (window.innerWidth < 900) {
          const sb = document.querySelector('.sidebar');
          if (sb) sb.style.display = 'none';
          window.scrollTo(0,0);
        }
      };
    });

  initClientSearch();

  initClientModal(
    supabase,
    state
  );
}