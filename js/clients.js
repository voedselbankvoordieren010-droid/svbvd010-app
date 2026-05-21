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
      <p>Fout bij laden cliënten</p>
    `;

    return;
  }

  if (!data.length) {

    container.innerHTML = `
      <p>Geen cliënten gevonden</p>
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

      <button id="newClientBtn">
        + Nieuwe cliënt
      </button>

    </div>

    <div class="client-grid">

      ${data.map(client => `

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
              ${client.status}
            "
          >
            ${client.status || "-"}
          </div>

        </div>

      `).join("")}

    </div>
  `;

  // detail modal
  document
    .querySelectorAll(
      ".client-card"
    )
    .forEach(card => {

      card.onclick = () => {

        const client =
          data.find(
            c =>
              c.id ===
              card.dataset.id
          );

        if (!client) return;

        showClientDetails(
          client
        );
      };
    });

  // zoekfunctie
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
            .toLowerCase();

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

  if (!btn) return;

  btn.onclick = () => {

    const modal =
      document.createElement("div");

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

    document
      .getElementById(
        "closeModalBtn"
      )
      .onclick = () => {

        modal.remove();
      };

    document
      .getElementById(
        "saveClientBtn"
      )
      .onclick = async () => {

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

        const city =
          document.getElementById(
            "clientCity"
          ).value;

        const address =
          document.getElementById(
            "clientAddress"
          ).value;

        const postal_code =
          document.getElementById(
            "clientPostal"
          ).value;

        const animals =
          document.getElementById(
            "clientAnimals"
          ).value
          .split("\n")
          .filter(Boolean);

        const notes =
          document.getElementById(
            "clientNotes"
          ).value;

        const { error } =
          await supabase
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

          alert(
            error.message
          );

          return;
        }

        modal.remove();

        loadClients(
          supabase,
          state
        );
      };
  };
}

function showClientDetails(
  client
) {

  const modal =
    document.createElement("div");

  modal.className =
    "modal-overlay";

  modal.innerHTML = `

    <div class="modal">

      <h2>
        ${client.full_name}
      </h2>

      <p>
        📧 ${client.email || "-"}
      </p>

      <p>
        📞 ${client.phone || "-"}
      </p>

      <p>
        📍 ${client.address || "-"}
      </p>

      <p>
        ${client.postal_code || "-"}
      </p>

      <p>
        Status:
        ${client.status || "-"}
      </p>

      <h3>
        Dieren
      </h3>

      <ul>

        ${(client.animals || [])
          .map(animal => `
            <li>${animal}</li>
          `)
          .join("")}

      </ul>

      <h3>
        Notities
      </h3>

      <p>
        ${client.notes || ""}
      </p>

      <div class="modal-actions">

        <button
          id="approveClientBtn"
        >
          Goedkeuren
        </button>

        <button
          id="spoedClientBtn"
        >
          Spoed
        </button>

        <button
          id="closeDetailsBtn"
        >
          Sluiten
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  document
    .getElementById(
      "closeDetailsBtn"
    )
    .onclick = () => {

      modal.remove();
    };

  document
    .getElementById(
      "approveClientBtn"
    )
    .onclick = async () => {

      await updateClientStatus(
        client.id,
        "actief"
      );

      modal.remove();
    };

  document
    .getElementById(
      "spoedClientBtn"
    )
    .onclick = async () => {

      await updateClientStatus(
        client.id,
        "spoed"
      );

      modal.remove();
    };
}

async function updateClientStatus(
  clientId,
  status
) {

  const { error } =
    await window.supabase
      .from("clients")
      .update({
        status
      })
      .eq(
        "id",
        clientId
      );

  if (error) {

    alert(
      error.message
    );

    return;
  }

  location.reload();
}