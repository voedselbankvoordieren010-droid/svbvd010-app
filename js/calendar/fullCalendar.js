import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getDutchHolidays, buildCalendarIcs, notifyClientsForEvent } from "../calendar.js";

export async function loadFullCalendar(
  supabase
) {

  const container =
    document.getElementById(
      "loadFullCalendar"
    );

  if (!container) {
    return;
  }

  container.innerHTML =
    `

      <div
        id="calendar"
      >
      </div>

    `;

  const [{ data, error }, { data: clientsData }] = await Promise.all([
    supabase.from("events").select("*"),
    supabase.from("clients").select("id, full_name").order("full_name", { ascending: true })
  ]);

  if (error) {

    console.error(error);

    container.innerHTML =
      "Fout bij laden agenda";

    return;
  }

  const rawEvents = (data || []);

  const holidays = getDutchHolidays(new Date().getFullYear());

  const mapColor = ev => {
    if (ev.is_holiday) return "#facc15"; // geel
    if (ev.is_urgent || ev.priority === "urgent" || ev.is_spoed) return "#dc2626"; // rood
    if (ev.status === "confirmed" || ev.confirmed || ev.is_confirmed) return "#16a34a"; // groen
    if (ev.is_vet || /dierenarts|dieren/i.test(ev.title || "")) return "#2563eb"; // blauw
    if (ev.client_id) return "#ff6600"; // oranje
    return "#374151"; // default
  };

  const events = [
    ...holidays.map(h => ({
      id: h.id,
      title: h.title,
      start: h.start_at.split("T")[0],
      end: h.end_at ? h.end_at.split("T")[0] : h.start_at.split("T")[0],
      color: "#facc15",
      extendedProps: { original: h }
    })),
    ...rawEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_at,
      end: event.end_at || event.start_at,
      color: mapColor(event),
      extendedProps: { original: event }
    }))
  ];

  const calendarEl =
    document.getElementById(
      "calendar"
    );

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: "nl",
    height: "auto",
    events,
    dateClick(info) {
      alert(`Nieuwe afspraak op ${info.dateStr}`);
    },
    eventClick(info) {
      openEventModal(info.event);
    }
  });

  // client filter UI
  const clients = Array.isArray(clientsData) ? clientsData : [];
  const filterRow = document.createElement("div");
  filterRow.className = "calendar-filter-row";
  filterRow.innerHTML = `
    <label style="display:inline-block;margin-right:8px">Filter cliënt:</label>
    <select id="calendarClientFilter"><option value="">Alle cliënten</option>
      ${clients.map(c => `<option value="${c.id}">${c.full_name}</option>`).join("")}
    </select>
  `;
  container.insertBefore(filterRow, calendarEl);

  const clientSelect = document.getElementById("calendarClientFilter");
  clientSelect.addEventListener("change", () => {
    const clientId = clientSelect.value;
    const filtered = events.filter(e => {
      const orig = e.extendedProps && e.extendedProps.original;
      if (!clientId) return true;
      // holidays and events with null client_id apply to all
      if (!orig) return true;
      return !orig.client_id || String(orig.client_id) === String(clientId);
    });
    calendar.removeAllEventSources();
    calendar.addEventSource(filtered);
  });

  calendar.render();

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

  async function fetchEvents() {
    const { data: freshData } = await supabase.from("events").select("*").order("start_at", { ascending: true });
    const raw = Array.isArray(freshData) ? freshData : [];
    const freshHolidays = getDutchHolidays(new Date().getFullYear());
    const refreshed = [
      ...freshHolidays.map(h => ({
        id: h.id,
        title: h.title,
        start: h.start_at.split("T")[0],
        end: h.end_at ? h.end_at.split("T")[0] : h.start_at.split("T")[0],
        color: "#facc15",
        extendedProps: { original: h }
      })),
      ...raw.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_at,
        end: event.end_at || event.start_at,
        color: mapColor(event),
        extendedProps: { original: event }
      }))
    ];
    calendar.removeAllEvents();
    calendar.addEventSource(refreshed);
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.className = "fc-modal";
    modal.style = "position:fixed;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);z-index:9999;";
    modal.innerHTML = `
      <div style="background:#fff;padding:16px;max-width:520px;width:100%;border-radius:8px;">
        <h3 id="fcModalTitle">Event</h3>
        <label>Titel<br><input id="fcTitle" type="text" style="width:100%"></label>
        <label>Omschrijving<br><textarea id="fcDescription" rows="3" style="width:100%"></textarea></label>
        <label>Start<br><input id="fcStart" type="datetime-local" style="width:100%"></label>
        <label>Eind<br><input id="fcEnd" type="datetime-local" style="width:100%"></label>
        <label>Cliënt<br><select id="fcClient" style="width:100%"><option value="">Alle cliënten</option>${clients.map(c=>`<option value="${c.id}">${c.full_name}</option>`).join("")}</select></label>
        <div style="margin-top:8px;text-align:right">
          <button id="fcIcs">Download ICS</button>
          <button id="fcDelete" style="margin-left:8px">Verwijderen</button>
          <button id="fcSave" style="margin-left:8px">Opslaan</button>
          <button id="fcCancel" style="margin-left:8px">Annuleren</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal(modal) {
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
  }

  async function openEventModal(eventObj) {
    const orig = eventObj.extendedProps?.original || {};
    const modal = createModal();
    document.getElementById("fcModalTitle").textContent = orig.title || eventObj.title || "Event";
    document.getElementById("fcTitle").value = orig.title || eventObj.title || "";
    document.getElementById("fcDescription").value = orig.description || orig.note || "";
    document.getElementById("fcStart").value = toInputValue(orig.start_at || eventObj.start);
    document.getElementById("fcEnd").value = toInputValue(orig.end_at || eventObj.end || eventObj.start);
    document.getElementById("fcClient").value = orig.client_id || "";

    document.getElementById("fcCancel").onclick = () => closeModal(modal);

    document.getElementById("fcIcs").onclick = () => {
      const item = orig.id ? orig : {
        id: eventObj.id,
        title: eventObj.title,
        start_at: eventObj.startStr || orig.start_at,
        end_at: eventObj.endStr || orig.end_at
      };
      const ics = buildCalendarIcs([item], item.title);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(item.title||"event").replace(/\s+/g,'-').toLowerCase()}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    document.getElementById("fcDelete").onclick = async () => {
      if (!orig.id) { closeModal(modal); return; }
      if (!confirm("Weet je zeker dat je deze afspraak wilt verwijderen?")) return;
      const { error } = await supabase.from("events").delete().eq("id", orig.id);
      if (error) { alert("Fout bij verwijderen"); return; }
      closeModal(modal);
      await fetchEvents();
    };

    document.getElementById("fcSave").onclick = async () => {
      const title = document.getElementById("fcTitle").value.trim();
      const description = document.getElementById("fcDescription").value.trim();
      const start_at = document.getElementById("fcStart").value;
      const end_at = document.getElementById("fcEnd").value || start_at;
      const client_id = document.getElementById("fcClient").value || null;

      if (!title || !start_at) { alert("Vul titel en starttijd in"); return; }

      const payload = {
        title,
        description,
        start_at: new Date(start_at).toISOString(),
        end_at: new Date(end_at).toISOString(),
        client_id,
      };

      let res;
      if (orig.id) {
        res = await supabase.from("events").update(payload).eq("id", orig.id).select();
      } else {
        res = await supabase.from("events").insert(payload).select();
      }

      if (res.error) { console.error(res.error); alert("Fout bij opslaan"); return; }
      const saved = Array.isArray(res.data) ? res.data[0] : res.data;
      await notifyClientsForEvent(supabase, saved);
      closeModal(modal);
      await fetchEvents();
    };
  }
}