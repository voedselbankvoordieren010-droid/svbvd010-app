import {
  showClientDetails
} from "./details/index.js";

import {
  initClientModal
} from "./modal";

import {
  initClientSearch
} from "./search";

import {
  sendNotification
} from "../notifications.js";

import {
  sendEmailApi,
  buildClientStatusHtml,
  buildHelperStatusHtml
} from "../email.js";

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

  const role = state.profile?.role;
  let query = supabase
    .from("client_aanvragen")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (role === "hulpverlener") {
    query = query.eq(
      "created_by",
      state.profile?.id
    );
  }

  const {
    data,
    error
  } = await query;

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

  const helperIds = [
    ...new Set(
      data
        .filter(c => c.created_by)
        .map(c => c.created_by)
    )
  ];

  let helperMap = new Map();
  if (helperIds.length) {
    const {
      data: helpers,
      error: helperError
    } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", helperIds);

    if (!helperError && helpers) {
      helperMap = new Map(
        helpers.map(h => [h.id, h])
      );
    }
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
        + Nieuwe aanvraag
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

            <p>
              Hulpverlener:
              ${helperMap.get(client.created_by)?.full_name || helperMap.get(client.created_by)?.email || (client.created_by ? "Onbekend" : "Niet toegewezen")}
            </p>

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

            ${role === "admin" ? `
              <div class="client-card-actions">
                <button class="btn approve-client-btn" data-client-id="${client.id}">Goedkeuren</button>
                <button class="btn btn-secondary reject-client-btn" data-client-id="${client.id}">Afwijzen</button>
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
            supabase,
            state
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

  document
    .querySelectorAll(
      ".approve-client-btn"
    )
    .forEach(btn => {
      btn.onclick = async event => {
        event.stopPropagation();
        const clientId = btn.dataset.clientId;
        await changeClientStatus(
          supabase,
          state,
          clientId,
          "goedgekeurd"
        );
        await loadClients(supabase, state, chat);
      };
    });

  document
    .querySelectorAll(
      ".reject-client-btn"
    )
    .forEach(btn => {
      btn.onclick = async event => {
        event.stopPropagation();
        const clientId = btn.dataset.clientId;
        await changeClientStatus(
          supabase,
          state,
          clientId,
          "afgewezen"
        );
        await loadClients(supabase, state, chat);
      };
    });

  initClientSearch();

  initClientModal(
    supabase,
    state
  );
}

async function changeClientStatus(
  supabase,
  state,
  clientId,
  newStatus
) {
  if (!clientId || !newStatus) {
    return;
  }

  const {
    data: clientData,
    error: clientError
  } = await supabase
    .from("clients")
    .select("*, created_by")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError || !clientData) {
    console.error(
      "CLIENT STATUS UPDATE ERROR:",
      clientError
    );
    alert("Kon cliënt niet bijwerken.");
    return;
  }

  const {
    error: updateError
  } = await supabase
    .from("clients")
    .update({
      status: newStatus
    })
    .eq("id", clientId);

  if (updateError) {
    console.error(updateError);
    alert("Kon status niet opslaan.");
    return;
  }

  const helperInfo = clientData.created_by
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", clientData.created_by)
        .maybeSingle()
    : { data: null };

  const clientProfileResult = await supabase
    .from("profiles")
    .select("id")
    .eq("client_id", clientData.id)
    .maybeSingle();

  let clientProfileId = clientProfileResult.data?.id;

  if (!clientProfileId && clientData.email) {
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", clientData.email)
      .maybeSingle();

    clientProfileId = emailProfile?.id;
  }

  const statusLabel = newStatus === "goedgekeurd"
    ? "goedgekeurd"
    : "afgewezen";

  const clientMessage = clientData.full_name
    ? `Je cliënt ${clientData.full_name} is ${statusLabel} door de admin. Je kunt nu afspraken inplannen.`
    : `Je cliënt is ${statusLabel} door de admin.`;

  const helperMessage = clientData.full_name
    ? `Cliënt ${clientData.full_name} is ${statusLabel}. Bekijk de cliënt in je overzicht.`
    : `Een cliënt is ${statusLabel}.`;

  if (clientProfileId) {
    await sendNotification(
      supabase,
      clientProfileId,
      clientMessage
    );
  }

  if (helperInfo.data?.id) {
    await sendNotification(
      supabase,
      helperInfo.data.id,
      helperMessage
    );

    if (helperInfo.data.email) {
      await safeSendEmail(
        helperInfo.data.email,
        `Cliënt ${clientData.full_name || "(zonder naam)"} is ${statusLabel}`,
        `Beste ${helperInfo.data.full_name || "hulpverlener"},\n\nCliënt ${clientData.full_name || "(zonder naam)"} is ${statusLabel} door de admin.\n\nMet vriendelijke groet,\nStichting SVBVD010`,
        buildHelperStatusHtml({
          clientName: clientData.full_name,
          statusLabel
        })
      );
    }
  }

  const clientEmail = clientData.email || null;
  if (clientProfileId || clientEmail) {
    await sendNotification(
      supabase,
      clientProfileId,
      clientMessage
    );

    if (clientEmail) {
      await safeSendEmail(
        clientEmail,
        `Je aanvraag is ${statusLabel}`,
        `Beste ${clientData.full_name || "cliënt"},\n\nJe aanvraag is ${statusLabel} door de admin.\n\nMet vriendelijke groet,\nStichting SVBVD010`,
        buildClientStatusHtml({
          clientName: clientData.full_name,
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
