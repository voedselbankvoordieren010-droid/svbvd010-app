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
    .onclick =
    () => {

      modal.remove();
    };
}

async function updateClientStatus(
  supabase,
  client,
  newStatus
) {
  const { error } = await supabase
    .from("clients")
    .update({ status: newStatus })
    .eq("id", client.id);

  if (error) {
    console.error(error);
    alert("Kon status niet bijwerken.");
    return;
  }

  const helperResult = client.created_by
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", client.created_by)
        .maybeSingle()
    : { data: null };

  const clientProfileResult = await supabase
    .from("profiles")
    .select("id")
    .eq("client_id", client.id)
    .maybeSingle();

  let clientProfileId = clientProfileResult.data?.id;
  if (!clientProfileId && client.email) {
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", client.email)
      .maybeSingle();

    clientProfileId = emailProfile?.id;
  }

  const statusLabel = newStatus === "goedgekeurd"
    ? "goedgekeurd"
    : "afgewezen";

  const helperMessage = client.full_name
    ? `Cliënt ${client.full_name} is ${statusLabel}. Bekijk de cliënt in je overzicht.`
    : `Een cliënt is ${statusLabel}.`;

  if (helperResult.data?.id) {
    await sendNotification(
      supabase,
      helperResult.data.id,
      helperMessage
    );

    if (helperResult.data.email) {
      await safeSendEmail(
        helperResult.data.email,
        `Cliënt ${client.full_name || "(zonder naam)"} is ${statusLabel}`,
        `Beste ${helperResult.data.full_name || "hulpverlener"},\n\nCliënt ${client.full_name || "(zonder naam)"} is ${statusLabel} door de admin.\n\nMet vriendelijke groet,\nStichting SVBVD010`,
        buildHelperStatusHtml({
          clientName: client.full_name,
          statusLabel
        })
      );
    }
  }

  if (clientProfileId || client.email) {
    await sendNotification(
      supabase,
      clientProfileId,
      clientMessage
    );

    if (client.email) {
      await safeSendEmail(
        client.email,
        `Je aanvraag is ${statusLabel}`,
        `Beste ${client.full_name || "cliënt"},\n\nJe aanvraag is ${statusLabel} door de admin.\n\nMet vriendelijke groet,\nStichting SVBVD010`,
        buildClientStatusHtml({
          clientName: client.full_name,
          statusLabel
        })
      );
    }
  }
}

async function safeSendEmail(to, subject, text, html) {
  try {
    await sendEmailApi({ to, subject, text, html });
  } catch (error) {
    console.warn("Email send failed, continuing zonder blokkade:", error);
  }
}
