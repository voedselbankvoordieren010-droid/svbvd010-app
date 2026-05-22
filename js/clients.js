import {
  showClientDetails
} from "./clientDetails";

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

  // CLIENTS OPHALEN
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

  // ERROR
  if (error) {

    console.error(error);

    container.innerHTML = `

      <p>
        Fout bij laden cliënten
      </p>

    `;

    return;
  }

  // GEEN CLIENTS
  if (!data?.length) {

    container.innerHTML = `

      <p>
        Geen cliënten gevonden
      </p>

    `;

    return;
  }

  // RENDER
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

      <button id="newClientBtn">
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

  // DETAIL MODAL
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

  // ZOEKEN
  const search =
    document.getElementById(
      "clientSearch"
    );

  if (search) {

    search.addEventListener(
      "input",
      e => {

        const value =
          e.target.value
            .toLowerCase()
            .trim();

        document
          .querySelectorAll(
            ".client-card"
          )
          .forEach(card => {

            const visible =
              card.innerText
                .toLowerCase()
                .includes(value);

            card.style.display =
              visible
                ? "block"
                : "none";
          });
      }
    );
  }

  // NIEUWE CLIENT
  initClientModal(
    supabase,
    state
  );
}

export function initClientModal(
  supabase,
  state
) {

  const btn =
    document.getElementById(
      "newClientBtn"
    );

  if (!btn) {
    return;
  }

  btn.onclick =
    () => {

      // BESTAANDE MODAL WEG
      const existing =
        document.querySelector(
          ".modal-overlay"
        );

      if (existing) {
        existing.remove();
      }

      const modal =
        document.createElement(
          "div"
        );

      modal.className =
        "modal-overlay";

      modal.innerHTML = `

        <div class="modal">

          <h2>
            Nieuwe cliënt
          </h2>

          <input
            id="clientName"
            placeholder="Naam"
          >

          <input
            id="clientEmail"
            placeholder="Email"
          >

          <input
            id="clientPhone"
            placeholder="Telefoon"
          >

          <input
            id="clientCity"
            placeholder="Plaats"
          >

          <input
            id="clientAddress"
            placeholder="Adres"
          >

          <input
            id="clientPostal"
            placeholder="Postcode"
          >

          <textarea
            id="clientAnimals"
            placeholder="Dieren (1 per regel)"
          ></textarea>

          <textarea
            id="clientNotes"
            placeholder="Notities"
          ></textarea>

          <div class="modal-actions">

            <button id="saveClientBtn">
              Opslaan
            </button>

            <button id="closeModalBtn">
              Sluiten
            </button>

          </div>

        </div>
      `;

      document.body.appendChild(
        modal
      );

      // SLUITEN
      document
        .getElementById(
          "closeModalBtn"
        )
        .onclick =
        () => {

          modal.remove();
        };

      // OPSLAAN
      document
        .getElementById(
          "saveClientBtn"
        )
        .onclick =
        async () => {

          const full_name =
            document.getElementById(
              "clientName"
            )?.value?.trim() || "";

          const email =
            document.getElementById(
              "clientEmail"
            )?.value?.trim() || "";

          const phone =
            document.getElementById(
              "clientPhone"
            )?.value?.trim() || "";

          const city =
            document.getElementById(
              "clientCity"
            )?.value?.trim() || "";

          const address =
            document.getElementById(
              "clientAddress"
            )?.value?.trim() || "";

          const postal_code =
            document.getElementById(
              "clientPostal"
            )?.value?.trim() || "";

          const animals =
            document.getElementById(
              "clientAnimals"
            )?.value
              ?.split("\n")
              .map(a => a.trim())
              .filter(Boolean) || [];

          const notes =
            document.getElementById(
              "clientNotes"
            )?.value?.trim() || "";

          const {
            error
          } = await supabase
            .from("clients")
            .insert({

              full_name,
              email,
              phone,
              city,
              address,
              postal_code,
              animals,
              notes,

              status: "nieuw",

              created_by:
                state.session.user.id
            });

          if (error) {

            console.error(error);

            alert(
              error.message
            );

            return;
          }

          modal.remove();

          await loadClients(
            supabase,
            state
          );
        };
    };
}
