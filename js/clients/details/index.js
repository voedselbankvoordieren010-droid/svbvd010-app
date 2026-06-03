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

import {
  renderClientDistributions
} from "./distributions.js";

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

        <button
          class="client-tab-btn"
          data-client-tab="distributions"
        >
          Uitgifte historie
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
      <p id="generalNotesText">${(client.notes || "").split("\n").filter(line => line && !line.startsWith("[UITGIFTE]")).join("\n") || "Geen notities"}</p>
  </div>

  <div class="info-card">
    <h3>Dieren</h3>
      <p id="generalAnimalsText">Laden...</p>
  </div>

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

      <div
        id="distributions"
        class="
          client-tab-panel
          hidden
        "
      >
        <h3>Uitgifte historie</h3>
        <div id="clientDistributionList"></div>
        <div class="modal-actions" style="margin-top:16px;">
          <button id="addDistributionBtn" class="btn" type="button">
            + Nieuwe uitgifte
          </button>
        </div>
      </div>

      <div class="modal-actions">
        ${isAdmin ? `
  <button
    id="editClientBtn"
    class="btn"
    type="button"
  >
    Bewerken
  </button>

  <button
    id="saveClientDetailsBtn"
    class="btn hidden"
    type="button"
  >
    Opslaan
  </button>

  <button
    id="cancelEditBtn"
    class="btn btn-secondary hidden"
    type="button"
  >
    Annuleren
  </button>

  <button
    id="warningClientBtn"
    class="btn btn-secondary"
    type="button"
  >
    Waarschuwing
  </button>
` : ""}

        <button
          id="closeClientDetails"
          class="btn"
          type="button"
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

  const animalsList = await renderClientAnimals(
    client,
    supabase,
    updateGeneralAnimalsSummary
  );

  updateGeneralAnimalsSummary(animalsList);

  await renderClientFiles(
    client,
    supabase
  );

  await renderClientNotes(
    client,
    supabase
  );

  await renderClientDistributions(
    client,
    supabase,
    state
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

const saveBtn =
  document.getElementById(
    "saveClientDetailsBtn"
  );

const cancelBtn =
  document.getElementById(
    "cancelEditBtn"
  );

if (editBtn) {

  editBtn.onclick =
    async () => {

      if (editMode) {
        return;
      }

      editMode = true;

      const generalPanel =
        modal.querySelector(
          "#general"
        );

      if (!generalPanel) {
        return;
      }

      generalPanel.innerHTML = `

          <h2>
            ${client.full_name}
          </h2>

          <div class="info-card">
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
          </div>

          <div class="info-card">
            <h3>Notities</h3>
            <textarea
              id="editNotes"
            >${client.notes || ""}</textarea>
          </div>

        `;

      editBtn.classList.add(
        "hidden"
      );

      if (cancelBtn) {
        cancelBtn.classList.remove(
          "hidden"
        );
        cancelBtn.onclick =
          () => {
            showClientDetails(
              client,
              supabase,
              state
            );
          };
      }

      if (saveBtn) {
        saveBtn.classList.remove(
          "hidden"
        );
      }
    };
}

if (saveBtn) {
  saveBtn.onclick =
    async () => {
      const full_name =
        document.getElementById(
          "editFullName"
        )?.value || "";

      const email =
        document.getElementById(
          "editEmail"
        )?.value || "";

      const phone =
        document.getElementById(
          "editPhone"
        )?.value || "";

      const city =
        document.getElementById(
          "editCity"
        )?.value || "";

      const address =
        document.getElementById(
          "editAddress"
        )?.value || "";

      const postal_code =
        document.getElementById(
          "editPostalCode"
        )?.value || "";

      const notes =
        document.getElementById(
          "editNotes"
        )?.value || "";

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

async function renderClientDistributions(client, supabase, state) {
  const listEl = document.getElementById(
    "clientDistributionList"
  );
  if (!listEl) {
    return;
  }

  const distributionLines = (client.notes || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => line.startsWith("[UITGIFTE]"));

  if (!distributionLines.length) {
    listEl.innerHTML = `
      <p>Geen uitgiftegeschiedenis gevonden.</p>
    `;
  } else {
    listEl.innerHTML = `
      <ul class="distribution-list">
        ${distributionLines
          .map(line => `
            <li>${line.replace(/^\[UITGIFTE\]\s*/, "")}</li>
          `)
          .join("")}
      </ul>
    `;
  }

  const addBtn = document.getElementById(
    "addDistributionBtn"
  );

  if (!addBtn) {
    return;
  }

  addBtn.onclick = async () => {
    const item = prompt("Welk product is uitgegeven?");
    if (!item) {
      return;
    }

    const amount = prompt("Hoeveelheid?");
    if (!amount) {
      return;
    }

    const note = prompt("Extra toelichting (optioneel)")?.trim() || "";
    const userName =
      state?.profile?.full_name ||
      state?.profile?.email ||
      "Systeem";
    const date = new Date().toLocaleDateString("nl-NL");
    const distributionLine = `[UITGIFTE] ${date} - ${amount} ${item}${note ? ` - ${note}` : ""} - door ${userName}`;

    const existingDistributionLines = (client.notes || "")
      .split("\n")
      .filter(line => line.startsWith("[UITGIFTE]"));

    const otherLines = (client.notes || "")
      .split("\n")
      .filter(line => line && !line.startsWith("[UITGIFTE]"));

    const updatedNotes = [
      ...existingDistributionLines,
      distributionLine,
      ...otherLines
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase
      .from("clients")
      .update({ notes: updatedNotes })
      .eq("id", client.id);

    if (error) {
      alert(error.message);
      return;
    }

    client.notes = updatedNotes;
    await renderClientDistributions(client, supabase, state);
    await renderClientNotes(client, supabase);
  };
}

function updateGeneralAnimalsSummary(animals = []) {
  const summaryEl =
    document.getElementById(
      "generalAnimalsText"
    );

  if (!summaryEl) {
    return;
  }

  if (!animals.length) {
    summaryEl.textContent =
      "Geen dieren toegevoegd";
    return;
  }

  summaryEl.textContent =
    `${animals.length} dier(en): ${animals
      .map((animal) => animal.name || "Onbekend")
      .join(", ")}`;
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
}
