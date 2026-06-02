import {
  initClientTabs
} from "./tabs.js";

import {
  renderClientFiles
} from "./files.js";

import {
  renderClientAnimals
} from "./animals.js";

import {
  renderClientNotes
} from "./notes.js";

export async function showClientDetails(
  client,
  supabase,
  state
) {

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

  const helperResult = client.created_by
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", client.created_by)
        .maybeSingle()
    : { data: null };

  const helper = helperResult.data;
  const isAdmin = state?.profile?.role === "admin";

  modal.innerHTML = `

    <div class="modal large-modal">

      <div class="client-tabs">

        <button
          class="
            client-tab-btn
            is-active
          "
          data-client-tab="general"
        >
          Algemeen
        </button>

        <button
          class="client-tab-btn"
          data-client-tab="animals"
        >
          Dieren
        </button>

        <button
          class="client-tab-btn"
          data-client-tab="files"
        >
          Bestanden
        </button>

        <button
          class="client-tab-btn"
          data-client-tab="notes"
        >
          Notities
        </button>

      </div>

      <div
  id="general"
  class="client-tab-panel"
>

  <h2>
    ${client.full_name}
  </h2>

  <div class="info-card">

    <p>
      <strong>Naam:</strong>
      ${client.full_name || "-"}
    </p>

    <p>
      <strong>E-mail:</strong>
      ${client.email || "-"}
    </p>

    <p>
      <strong>Telefoon:</strong>
      ${client.phone || "-"}
    </p>

    <p>
      <strong>Plaats:</strong>
      ${client.city || "-"}
    </p>

    <p>
      <strong>Adres:</strong>
      ${client.address || "-"}
    </p>

    <p>
      <strong>Postcode:</strong>
      ${client.postal_code || "-"}
    </p>

    <p>
      <strong>Status:</strong>
      ${client.status || "nieuw"}
    </p>

    <p>
      <strong>Hulpverlener:</strong>
      ${helper ? `${helper.full_name || helper.email}` : "Niet toegewezen"}
    </p>

  </div>

  <div class="info-card">
    <h3>Notities</h3>
      <p id="generalNotesText">${client.notes || "Geen notities"}</p>
</div>

      <div
        id="animals"
        class="
          client-tab-panel
          hidden
        "
      >
      </div>

      <div
        id="files"
        class="
          client-tab-panel
          hidden
        "
      >
      </div>

      <div
        id="notes"
        class="
          client-tab-panel
          hidden
        "
      >
      </div>

      <div class="modal-actions">
        ${isAdmin ? `
  <button
    id="editClientBtn"
    class="btn"
  >
    Bewerken
  </button>

  <button
    id="warningClientBtn"
    class="btn btn-secondary"
  >
    Waarschuwing
  </button>
` : ""}

        <button
          id="closeClientDetails"
          class="btn"
        >
          Sluiten
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  initClientTabs();

  await renderClientAnimals(
    client,
    supabase
  );

  await renderClientFiles(
    client,
    supabase
  );

  await renderClientNotes(
    client,
    supabase
  );

  document
  .getElementById(
    "closeClientDetails"
  )
  .onclick =
  () => {

    modal.remove();
  };

let editMode = false;

const editBtn =
  document.getElementById(
    "editClientBtn"
  );

if (editBtn) {

  editBtn.onclick =
    async () => {

      if (!editMode) {

        editMode = true;

        const infoCard =
          modal.querySelector(
            ".info-card"
          );

        infoCard.innerHTML = `

          <p>
            🧑‍💼 Naam
            <input
              id="editFullName"
              value="${client.full_name || ""}"
            >
          </p>

          <p>
            📧
            <input
              id="editEmail"
              value="${client.email || ""}"
            >
          </p>

          <p>
            📞
            <input
              id="editPhone"
              value="${client.phone || ""}"
            >
          </p>

          <p>
            📍
            <input
              id="editCity"
              value="${client.city || ""}"
            >
          </p>

          <p>
            🏠
            <input
              id="editAddress"
              value="${client.address || ""}"
            >
          </p>

          <p>
            📮
            <input
              id="editPostalCode"
              value="${client.postal_code || ""}"
            >
          </p>

          <p>
            📝 Notities
            <textarea
              id="editNotes"
            >${client.notes || ""}</textarea>
          </p>

        `;

        editBtn.textContent =
          "Opslaan";

        return;
      }

      const full_name =
        document.getElementById(
          "editFullName"
        ).value;

      const email =
        document.getElementById(
          "editEmail"
        ).value;

      const phone =
        document.getElementById(
          "editPhone"
        ).value;

      const city =
        document.getElementById(
          "editCity"
        ).value;

      const address =
        document.getElementById(
          "editAddress"
        ).value;

      const postal_code =
        document.getElementById(
          "editPostalCode"
        ).value;

      const notes =
        document.getElementById(
          "editNotes"
        ).value;

      const { error } =
        await supabase
          .from("clients")
          .update({
            full_name,
            email,
            phone,
            city,
            address,
            postal_code,
            notes
          })
          .eq(
            "id",
            client.id
          );

      if (error) {

        alert(
          error.message
        );

        return;
      }

      alert(
        "Cliënt opgeslagen"
      );

      modal.remove();

      await showClientDetails(
        {
          ...client,
          full_name,
          email,
          phone,
          city,
          address,
          postal_code,
          notes
        },
        supabase,
        state
      );
    };
}

const warningBtn =
  document.getElementById(
    "warningClientBtn"
  );

if (warningBtn) {

  warningBtn.onclick =
    async () => {

      const warning =
        prompt(
          "Voer waarschuwing in"
        );

      if (!warning) {
        return;
      }

      const { error } =
        await supabase
          .from("clients")
          .update({
            warning_notes:
              warning
          })
          .eq(
            "id",
            client.id
          );

      if (error) {

        alert(
          error.message
        );

        return;
      }

      alert(
        "Waarschuwing opgeslagen"
      );
    };
}
