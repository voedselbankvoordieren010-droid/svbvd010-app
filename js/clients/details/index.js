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
  sendNotification
} from "../../notifications.js";

import {
  sendEmailApi,
  buildClientStatusHtml,
  buildHelperStatusHtml
} from "../../email.js";

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
      📧 ${client.email || "-"}
    </p>

    <p>
      📞 ${client.phone || "-"}
    </p>

    <p>
      📍 ${client.city || "-"}
    </p>

    <p>
      🏠 ${client.address || "-"}
    </p>

    <p>
      📮 ${client.postal_code || "-"}
    </p>

    <p>
      📌 Status:
      ${client.status || "nieuw"}
    </p>

    <p>
      🧑‍⚕️ Hulpverlener:
      ${helper ? `${helper.full_name || helper.email}` : "Niet toegewezen"}
    </p>

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

  renderClientFiles(
    client,
    supabase
  );

  renderClientNotes(
    client
  );

  document
    .getElementById(
      "closeClientDetails"
    )
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

      alert(
        "Bewerken werkt"
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
        alert(error.message);
        return;
      }

      alert(
        "Waarschuwing opgeslagen"
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

      modal.remove();
    };
}



async function safeSendEmail(to, subject, text, html) {
  try {
    await sendEmailApi({ to, subject, text, html });
  } catch (error) {
    console.warn("Email send failed, continuing zonder blokkade:", error);
  }
}
}