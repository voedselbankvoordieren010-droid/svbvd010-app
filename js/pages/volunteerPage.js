import { initChat } from "../chat.js";
import { loadFullCalendar } from "../calendar/fullCalendar.js";

const REGIONS = [
  "Alle regio's",
  "Capelle aan den IJssel",
  "Nieuwerkerk aan den IJssel",
  "Krimpen aan den IJssel",
  "Ommoord",
  "Zevenkamp",
  "Alexanderpolder"
];

export async function renderVolunteerPage(supabase, state) {
  const container = document.getElementById("volunteer");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="volunteer-page" style="display:grid;grid-template-columns:1.45fr 1fr;gap:18px;align-items:flex-start;">
      <div style="display:grid;gap:18px;">
        <section class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <h2 style="margin:0">Chat</h2>
              <p style="margin:4px 0 0;color:#666;font-size:0.95rem;">Admin en vrijwilliger kunnen hier bij elkaar inloggen.</p>
            </div>
          </div>
          <div id="volunteerChatHeader" class="chat-header">Vrijwilliger inbox</div>
          <div id="volunteerChatConversations" class="chat-conversations"></div>
          <div id="volunteerChatList" class="chat-list"></div>
          <div class="chat-input-row">
            <input id="volunteerChatInput" type="text" placeholder="Typ een bericht..." autocomplete="off">
            <button id="volunteerSendChatBtn" class="btn">Verzenden</button>
          </div>
        </section>

        <section class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h2 style="margin:0">Cliënten per regio</h2>
          </div>
          <label style="display:block;margin-bottom:12px;">
            Selecteer regio
            <select id="volunteerRegionFilter" style="width:100%;padding:8px;margin-top:8px;border:1px solid #d1d5db;border-radius:6px;">
              ${REGIONS.map(region => `<option value="${region}">${region}</option>`).join("")}
            </select>
          </label>
          <div id="volunteerClientList" class="client-grid"></div>
        </section>
      </div>

      <section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <h2 style="margin:0">Agenda</h2>
            <p style="margin:4px 0 0;color:#666;font-size:0.95rem;">Afspraken toevoegen en beheren voor cliënten.</p>
          </div>
        </div>
        <div id="volunteerCalendar"></div>
      </section>
    </div>
  `;

  const chat = initChat(supabase, state, "volunteer-");
  chat.init();

  await loadFullCalendar(supabase, state, "volunteerCalendar");
  await loadVolunteerClients(supabase, chat);

  const regionFilter = document.getElementById("volunteerRegionFilter");
  if (regionFilter) {
    regionFilter.addEventListener("change", () => {
      loadVolunteerClients(supabase, chat, regionFilter.value);
    });
  }
}

async function loadVolunteerClients(supabase, chat, region = "Alle regio's") {
  const listEl = document.getElementById("volunteerClientList");
  if (!listEl) {
    return;
  }

  listEl.innerHTML = `<p>Laden cliënten...</p>`;

  let query = supabase
    .from("clients")
    .select("id, full_name, email, phone, city, postal_code, address, status")
    .order("full_name", { ascending: true });

  if (region && region !== "Alle regio's") {
    const normalized = region.toLowerCase();
    query = query.or(
      `city.ilike.%${normalized}%,address.ilike.%${normalized}%,postal_code.ilike.%${normalized}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Volunteer clients load error:", error);
    listEl.innerHTML = `<p>Fout bij laden cliënten.</p>`;
    return;
  }

  if (!data?.length) {
    listEl.innerHTML = `<p>Geen cliënten gevonden voor ${region}.</p>`;
    return;
  }

  listEl.innerHTML = `
    <div class="client-grid" style="display:grid;grid-template-columns:1fr;gap:12px;">
      ${data
        .map(client => {
          const location = client.city || client.address || "-";
          const phone = client.phone || "-";
          const email = client.email || "-";
          return `
            <div class="client-card" style="padding:14px;">
              <h3 style="margin:0 0 8px;">${client.full_name || "Onbekende cliënt"}</h3>
              <p style="margin:0 0 4px;opacity:.85;">${location}</p>
              <p style="margin:0 0 4px;">${email}</p>
              <p style="margin:0 0 8px;">${phone}</p>
              <button class="btn open-client-chat" data-client-id="${client.id}" data-client-name="${client.full_name || client.email || "Cliënt"}">
                Chat met cliënt
              </button>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  listEl.querySelectorAll(".open-client-chat").forEach(button => {
    button.addEventListener("click", async () => {
      const clientId = button.dataset.clientId;
      const clientName = button.dataset.clientName;
      await chat.openConversationForClient(clientId, clientName);
    });
  });
}
