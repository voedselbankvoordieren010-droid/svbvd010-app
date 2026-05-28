const DUTCH_HOLIDAY_STARTS = {
  2026: [
    { title: "Nieuwjaarsdag", date: "2026-01-01" },
    { title: "Goede Vrijdag", date: "2026-03-27" },
    { title: "Pasen", date: "2026-03-29" },
    { title: "Tweede Paasdag", date: "2026-03-30" },
    { title: "Koningsdag", date: "2026-04-27" },
    { title: "Bevrijdingsdag", date: "2026-05-05" },
    { title: "Hemelvaartsdag", date: "2026-05-14" },
    { title: "Pinksteren", date: "2026-05-24" },
    { title: "Tweede Pinksterdag", date: "2026-05-25" },
    { title: "Eerste Kerstdag", date: "2026-12-25" },
    { title: "Tweede Kerstdag", date: "2026-12-26" }
  ]
};

export function getDutchHolidays(year) {
  const days = DUTCH_HOLIDAY_STARTS[year] || [];
  return days.map(({ title, date }) => ({
    id: `holiday-${year}-${date}`,
    title,
    description: `${title} in Nederland`,
    start_at: `${date}T09:00:00Z`,
    end_at: `${date}T10:00:00Z`,
    is_holiday: true,
    holiday_code: title.toLowerCase().replace(/\s+/g, "-"),
    client_id: null,
    all_clients: true
  }));
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function sortEvents(events) {
  return [...events].sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
}

export function buildCalendarIcs(events, title = "SVBVD010 Agenda") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SVBVD010//Agenda//NL"
  ];

  events.forEach(event => {
    const uid = event.id || `${event.holiday_code || event.title}-${event.start_at}`;
    const dtstamp = formatIcsDate(new Date());
    const dtstart = formatIcsDate(new Date(event.start_at));
    const dtend = formatIcsDate(new Date(event.end_at || event.start_at));

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(event.description || "")}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(text) {
  return String(text || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function loadAdminAgenda(supabase, state, canEdit) {
  const container = document.getElementById("adminAgenda");
  if (!container) return;

  container.innerHTML = `<div class="card"><p>Laden...</p></div>`;

  const year = new Date().getFullYear();
  const holidays = getDutchHolidays(year);

  const { data, error } = await supabase
    .from("events")
    .select("*, clients(id, full_name), profiles(id, email)")
    .order("start_at", { ascending: true });

  const events = Array.isArray(data) ? data : [];
  const displayEvents = sortEvents([...holidays, ...events]);

  container.innerHTML = `
    <div class="agenda-header">
      <div>
        <h1>Agenda</h1>
        <p>Alle Nederlandse feestdagen zijn toegevoegd. Admin kan afspraken toevoegen en bewerken.</p>
      </div>
      <div class="agenda-actions">
        <button id="newAgendaEventBtn" class="btn">+ Nieuwe afspraak</button>
        <button id="downloadAgendaBtn" class="btn">Download agenda</button>
      </div>
    </div>
    <div id="adminAgendaList" class="agenda-grid"></div>
    <div id="adminAgendaForm" class="agenda-form hidden"></div>
  `;

  const agendaList = document.getElementById("adminAgendaList");
  const formContainer = document.getElementById("adminAgendaForm");

  if (!agendaList || !formContainer) return;

  agendaList.innerHTML = displayEvents.length
    ? displayEvents.map(event => renderEventCard(event, canEdit)).join("")
    : `<div class="card"><p>Geen afspraken of feestdagen gevonden.</p></div>`;

  const downloadBtn = document.getElementById("downloadAgendaBtn");
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const allEvents = displayEvents.map(event => ({
        ...event,
        description: event.description || (event.is_holiday ? "Nederlandse feestdag" : "Agenda item")
      }));
      const ics = buildCalendarIcs(allEvents, "SVBVD010 Agenda");
      downloadTextFile("svbvd010-agenda.ics", ics);
    };
  }

  if (canEdit) {
    const newBtn = document.getElementById("newAgendaEventBtn");
    if (newBtn) {
      newBtn.onclick = async () => {
        await renderAgendaForm(supabase, state, formContainer, null);
      };
    }
  } else {
    const newBtn = document.getElementById("newAgendaEventBtn");
    if (newBtn) {
      newBtn.style.display = "none";
    }
  }

  document.querySelectorAll(".agenda-edit-btn").forEach(button => {
    button.onclick = async event => {
      const id = button.dataset.eventId;
      if (!id) return;
      await renderAgendaForm(supabase, state, formContainer, displayEvents.find(evt => String(evt.id) === id));
    };
  });

  document.querySelectorAll(".agenda-delete-btn").forEach(button => {
    button.onclick = async event => {
      const id = button.dataset.eventId;
      if (!id || !confirm("Weet je zeker dat je deze afspraak wilt verwijderen?")) return;
      const { error: deleteError } = await supabase.from("events").delete().eq("id", id);
      if (deleteError) {
        console.error(deleteError);
        alert("Fout bij verwijderen afspraak.");
        return;
      }
      await loadAdminAgenda(supabase, state, canEdit);
    };
  });

  document.querySelectorAll(".agenda-download-btn").forEach(button => {
    button.onclick = () => {
      const id = button.dataset.eventId;
      const event = displayEvents.find(evt => String(evt.id) === id);
      if (!event) return;
      const ics = buildCalendarIcs([event], event.title);
      downloadTextFile(`${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`, ics);
    };
  });
}

function renderEventCard(event, canEdit) {
  const isHoliday = event.is_holiday;
  const subtitle = event.client_id ? `Voor cliënt: ${event.clients?.full_name || "Onbekend"}` : "Voor alle cliënten";
  return `
    <div class="event-card ${isHoliday ? "holiday" : ""}">
      <div class="event-row">
        <div>
          <h2>${event.title}</h2>
          <p class="event-meta">${subtitle}</p>
          <p class="event-meta">${formatDateTime(event.start_at)} - ${formatDateTime(event.end_at || event.start_at)}</p>
          <p>${event.description || "Geen omschrijving."}</p>
        </div>
        <div class="event-actions">
          <button class="btn agenda-download-btn" data-event-id="${event.id}">📅 Toevoegen aan agenda</button>
          ${canEdit && !isHoliday ? `<button class="btn agenda-edit-btn" data-event-id="${event.id}">Bewerken</button>` : ""}
          ${canEdit && !isHoliday ? `<button class="btn btn-danger agenda-delete-btn" data-event-id="${event.id}">Verwijderen</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

async function renderAgendaForm(supabase, state, container, event) {
  const allClients = await loadEventClients(supabase);
  container.innerHTML = `
    <div class="card">
      <h2>${event ? "Bewerk afspraak" : "Nieuwe afspraak"}</h2>
      <label>Onderwerp
        <input id="agendaTitle" type="text" value="${event?.title || ""}" placeholder="Bijvoorbeeld intakegesprek">
      </label>
      <label>Omschrijving
        <textarea id="agendaDescription" rows="3" placeholder="Extra informatie">${event?.description || ""}</textarea>
      </label>
      <label>Datum en starttijd
        <input id="agendaStart" type="datetime-local" value="${event ? toInputValue(event.start_at) : ""}">
      </label>
      <label>Eindtijd
        <input id="agendaEnd" type="datetime-local" value="${event ? toInputValue(event.end_at) : ""}">
      </label>
      <label>Cliënt (leeg = alle cliënten)
        <select id="agendaClient">
          <option value="">Alle cliënten</option>
          ${allClients.map(client => `<option value="${client.id}" ${event?.client_id === client.id ? "selected" : ""}>${client.full_name || client.email}</option>`).join("")}
        </select>
      </label>
      <div class="agenda-form-actions">
        <button id="saveAgendaBtn" class="btn">Opslaan</button>
        <button id="cancelAgendaBtn" class="btn btn-secondary">Annuleren</button>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById("saveAgendaBtn");
  const cancelBtn = document.getElementById("cancelAgendaBtn");

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      container.classList.add("hidden");
      container.innerHTML = "";
    };
  }

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const title = document.getElementById("agendaTitle").value.trim();
      const description = document.getElementById("agendaDescription").value.trim();
      const start_at = document.getElementById("agendaStart").value;
      const end_at = document.getElementById("agendaEnd").value || document.getElementById("agendaStart").value;
      const client_id = document.getElementById("agendaClient").value || null;

      if (!title || !start_at) {
        alert("Vul een titel en starttijd in.");
        return;
      }

      const payload = {
        title,
        description,
        start_at: new Date(start_at).toISOString(),
        end_at: new Date(end_at).toISOString(),
        client_id,
        created_by_id: state.session.user.id
      };

      let response;
      if (event?.id) {
        response = await supabase.from("events").update(payload).eq("id", event.id);
      } else {
        response = await supabase.from("events").insert(payload);
      }

      if (response.error) {
        console.error(response.error);
        alert("Fout bij opslaan afspraak.");
        return;
      }

      const saved = Array.isArray(response.data) ? response.data[0] : response.data;
      await notifyClientsForEvent(supabase, saved);
      await loadAdminAgenda(supabase, state, true);
      container.classList.add("hidden");
      container.innerHTML = "";
    };
  }
}

function toInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  const pad = n => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function loadEventClients(supabase) {
  const { data, error } = await supabase.from("clients").select("id, full_name, email").order("full_name", { ascending: true });
  if (error || !Array.isArray(data)) {
    return [];
  }
  return data;
}

export async function notifyClientsForEvent(supabase, event) {
  const query = supabase.from("profiles").select("id");
  if (event.client_id) {
    query.eq("client_id", event.client_id).eq("role", "client");
  } else {
    query.in("role", ["client"]);
  }

  const { data: profiles, error } = await query;
  if (error || !Array.isArray(profiles) || !profiles.length) {
    return;
  }

  const notifications = profiles.map(profile => ({
    user_auth_id: profile.id,
    bericht: `Nieuwe agenda-afspraak: ${event.title}`,
    gelezen: false
  }));

  await supabase.from("notifications").insert(notifications);
}

export async function loadClientAgenda(supabase, profile) {
  const container = document.getElementById("clientAgenda");
  if (!container) return;
  if (!profile?.client_id) {
    container.innerHTML = `<div class="card"><p>Geen cliënt gekoppeld voor agenda.</p></div>`;
    return;
  }

  container.innerHTML = `<div class="card"><p>Laden...</p></div>`;
  const holidays = getDutchHolidays(new Date().getFullYear());

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`client_id.is.null,client_id.eq.${profile.client_id}`)
    .order("start_at", { ascending: true });

  const events = Array.isArray(data) ? data : [];
  const displayEvents = sortEvents([...holidays, ...events]);

  container.innerHTML = `
    <div class="agenda-header">
      <div>
        <h2>Mijn agenda</h2>
        <p>Je kunt deze afspraken downloaden en toevoegen aan je eigen agenda.</p>
      </div>
      <button id="downloadClientAgendaBtn" class="btn">Download agenda</button>
    </div>
    <div id="clientAgendaList" class="agenda-grid"></div>
  `;

  const list = document.getElementById("clientAgendaList");
  const downloadBtn = document.getElementById("downloadClientAgendaBtn");

  if (!list || !downloadBtn) return;

  if (!displayEvents.length) {
    list.innerHTML = `<div class="card"><p>Geen afspraken of feestdagen gepland.</p></div>`;
  } else {
    list.innerHTML = displayEvents.map(event => `
      <div class="event-card ${event.is_holiday ? "holiday" : ""}">
        <h3>${event.title}</h3>
        <p class="event-meta">${event.is_holiday ? "Feestdag" : event.description || "Afspraken"}</p>
        <p class="event-meta">${formatDateTime(event.start_at)} - ${formatDateTime(event.end_at || event.start_at)}</p>
        <button class="btn" data-event-id="${event.id || event.id}">Download ICS</button>
      </div>
    `).join("");

    list.querySelectorAll("button[data-event-id]").forEach(button => {
      button.onclick = () => {
        const id = button.dataset.eventId;
        const event = displayEvents.find(evt => String(evt.id) === id) || displayEvents.find(evt => evt.id === id);
        if (!event) return;
        const ics = buildCalendarIcs([event], event.title);
        downloadTextFile(`${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`, ics);
      };
    });
  }

  downloadBtn.onclick = () => {
    const allEvents = displayEvents.map(event => ({
      ...event,
      description: event.description || (event.is_holiday ? "Nederlandse feestdag" : "Agenda item")
    }));
    const ics = buildCalendarIcs(allEvents, `${profile.full_name || "Agenda"}`);
    downloadTextFile(`mijn-agenda.ics`, ics);
  };
}
