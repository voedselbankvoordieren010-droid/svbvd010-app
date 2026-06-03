import { loadNotifications } from "../notifications.js";
import { initChat } from "../chat.js";
import { loadUsers } from "../admin.js";
import { loadClients } from "../clients/index.js";
import { renderVolunteerPage } from "./volunteerPage.js";
// admin agenda is now handled by FullCalendar
import { loadFullCalendar } from "../calendar/fullCalendar.js";
import { loadAanvragen } from "./aanvragen.js";
export async function renderDashboard(supabase, state) {
  const app = document.getElementById("app");

  if (!app) {
    return;
  }

  app.innerHTML = `
<div class="dashboard-layout">
  <aside class="sidebar">
    <h1 class="logo">
      <img src="/logo.svg" alt="logo">
      <span>SVBVD010</span>
    </h1>

    <nav class="sidebar-nav">
      <button class="tab-button btn is-active" data-tab="dashboard">
        Dashboard
      </button>
      <button class="tab-button btn" data-tab="users">
        Gebruikers
      </button>
      <button class="tab-button btn" data-tab="chat">
        Chat
      </button>
      <button class="tab-button btn" data-tab="volunteer">
        Vrijwilliger
      </button>
      <button class="tab-button btn" data-tab="agenda">
        Agenda
      </button>
      <button class="tab-button btn" data-tab="clients">
        Cliënten
      </button>
      <button class="tab-button btn" data-tab="aanvragen">
       Aanvragen
      </button>
    </nav>
  </aside>

  <main class="main-content">
    <div class="topbar site-top">
      <div class="site-brand">
        <img class="site-logo" src="/logo.svg" alt="Stichting logo">
        <div class="site-title">Stichting</div>
      </div>
      <button id="sidebarToggle" class="btn sidebar-toggle">☰</button>

      <div id="userMeta">
        ${state.profile.email}
      </div>

      <div class="topbar-right">
        <div class="notif-wrapper">
          <button id="notifBell" class="tab-button btn">
            🔔
            <span id="notifCount"></span>
          </button>
          <div id="notifications"></div>
        </div>

        <button id="logoutBtn" class="btn">
          Uitloggen
        </button>
      </div>
    </div>

    <section id="dashboard" class="tab-panel">
      <h1>Dashboard</h1>
      <div class="cards">
        <div id="cardNieuw" class="card">Nieuw</div>
        <div id="cardIntake" class="card">Intake</div>
        <div id="cardSpoed" class="card">Spoed</div>
        <div id="loadFullCalendar" class="card calendar-card"></div>
      </div>
    </section>

    <section id="users" class="tab-panel hidden">
      <h1>Gebruikers</h1>
      <div id="userList"></div>
    </section>

    <section id="chat" class="tab-panel hidden">
      <div id="chatHeader">Vrijwilliger inbox</div>
      <div id="chatConversations"></div>
      <div id="chatList"></div>
      <div class="chat-input-row">
        <input id="chatInput" type="text" placeholder="Typ een bericht..." autocomplete="off">
        <button id="sendChatBtn">Verzenden</button>
      </div>
    </section>

    <section id="volunteer" class="tab-panel hidden"></section>

    <section id="agenda" class="tab-panel hidden">
      <div id="adminAgenda">Laden...</div>
    </section>

    <section id="clients" class="tab-panel hidden"></section>
  <section
  id="aanvragen"
  class="tab-panel hidden"
></section>
    </main>
</div>
`;

  const role = state.profile?.role;
  const pageTitle = role === "admin" ? "Beheer dashboard" : role === "hulpverlener" ? "Dashboard hulpverlener" : "Dashboard";
  const canViewUsers = role === "admin";
  const canViewVolunteer = ["admin", "hulpverlener"].includes(role);
  const canViewClients = ["admin", "hulpverlener", "intake"].includes(role);
  const canViewAgenda = ["admin", "hulpverlener"].includes(role);

  async function updateDashboardCounts() {
    const { data, error } = await supabase
      .from("client_aanvragen")
      .select("status");

    const counts = { nieuw: 0, intake: 0, spoed: 0 };
    if (!error && Array.isArray(data)) {
      data.forEach(item => {
        if (item.status === "nieuw") counts.nieuw += 1;
        if (item.status === "intake") counts.intake += 1;
        if (item.status === "spoed") counts.spoed += 1;
      });
    }

    document.getElementById("cardNieuw").textContent = `Nieuw (${counts.nieuw})`;
    document.getElementById("cardIntake").textContent = `Intake (${counts.intake})`;
    document.getElementById("cardSpoed").textContent = `Spoed (${counts.spoed})`;
  }

  const dashboardHeading = document.querySelector("#dashboard h1");
  if (dashboardHeading) {
    dashboardHeading.textContent = pageTitle;
  }

  await loadNotifications(supabase, state);
  await updateDashboardCounts();

  await loadFullCalendar(supabase, state);

  const chat = initChat(supabase, state);
  if (chat && chat.init) {
    chat.init();
  }

  if (!canViewUsers) {
    const usersBtn = document.querySelector('[data-tab="users"]');
    if (usersBtn) {
      usersBtn.remove();
    }
  }

  if (!canViewVolunteer) {
    const volunteerBtn = document.querySelector('[data-tab="volunteer"]');
    if (volunteerBtn) {
      volunteerBtn.remove();
    }
  }

  if (!canViewAgenda) {
    const agendaBtn = document.querySelector('[data-tab="agenda"]');
    if (agendaBtn) {
      agendaBtn.remove();
    }
  }

  if (!canViewClients) {
    const clientsBtn = document.querySelector('[data-tab="clients"]');
    if (clientsBtn) {
      clientsBtn.remove();
    }
  }


  const notifBell = document.getElementById("notifBell");
  const notifBox = document.getElementById("notifications");

  if (notifBell && notifBox) {
    notifBell.addEventListener("click", () => {
      notifBox.style.display = notifBox.style.display === "block" ? "none" : "block";
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      location.reload();
    });
  }

  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const sb = document.querySelector('.sidebar');
      if (!sb) return;
      sb.style.display = sb.style.display === 'none' ? '' : 'none';
    });
  }

  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.add("hidden"));

      const panel = document.getElementById(btn.dataset.tab);
      if (panel) {
        panel.classList.remove("hidden");
      }

      if (btn.dataset.tab === "dashboard") {
        loadFullCalendar(supabase, state).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }

      if (btn.dataset.tab === "users") {
        loadUsers(supabase, state);
      }

      if (btn.dataset.tab === "volunteer") {
        renderVolunteerPage(supabase, state);
      }

      if (btn.dataset.tab === "clients") {
        loadClients(supabase, state, chat);
      }

      if (btn.dataset.tab === "aanvragen") {
  loadAanvragen(
    supabase,
    state
  );
}
      if (btn.dataset.tab === "chat") {
        if (chat && chat.loadMessages) {
          chat.loadMessages();
        }
      }

      if (btn.dataset.tab === "agenda") {
        loadFullCalendar(supabase, state, "adminAgenda").then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }
    });
  });
}
