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
  container.innerHTML = `<div class="card"><p>Laden agenda (nieuwe weergave)...</p></div>`;
  try {
    const mod = await import("./calendar/fullCalendar.js");
    if (mod && mod.loadFullCalendar) {
      await mod.loadFullCalendar(supabase, state, "adminAgenda");
      return;
    }
  } catch (err) {
    console.error("Delegation to FullCalendar failed:", err);
  }
  container.innerHTML = `<div class="card"><p>Agenda kan niet worden geladen.</p></div>`;
}

// Old list-based UI removed. Helper functions (holidays, ICS, notifications) remain.

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
  // Delegate client agenda display to FullCalendar module for consistent UX.
  try {
    const mod = await import("./calendar/fullCalendar.js");
    if (mod && mod.loadFullCalendar) {
      await mod.loadFullCalendar(supabase, { profile }, "clientAgenda");
      return;
    }
  } catch (err) {
    console.error("Delegation to FullCalendar (client) failed:", err);
  }
  // Fallback: show simple message
  const container = document.getElementById("clientAgenda");
  if (container) {
    container.innerHTML = `<div class="card"><p>Agenda kan niet worden geladen.</p></div>`;
  }
}
