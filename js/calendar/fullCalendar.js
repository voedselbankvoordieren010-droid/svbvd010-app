import {
  loadFullCalendar
} from "./calendar/fullCalendar.js";

import { Calendar }
from "@fullcalendar/core";

import dayGridPlugin
from "@fullcalendar/daygrid";

import interactionPlugin
from "@fullcalendar/interaction";

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

  const {
    data,
    error
  } = await supabase
    .from("events")
    .select("*");

  if (error) {

    console.error(error);

    container.innerHTML =
      "Fout bij laden agenda";

    return;
  }

  const events =
    (data || []).map(
      event => ({

        id: event.id,

        title: event.title,

        start: event.start_at,

        end: event.end_at,

        color:
          event.is_holiday

            ? "#facc15"

            : "#ff6600"
      })
    );

  const calendarEl =
    document.getElementById(
      "calendar"
    );

  const calendar =
    new Calendar(

      calendarEl,

      {

        plugins: [

          dayGridPlugin,
          interactionPlugin
        ],

        initialView:
          "dayGridMonth",

        locale: "nl",

        height: "auto",

        events,

        dateClick(info) {

          alert(
            `Nieuwe afspraak op ${info.dateStr}`
          );
        },

        eventClick(info) {

          alert(
            info.event.title
          );
        }
      }
    );

  calendar.render();
}