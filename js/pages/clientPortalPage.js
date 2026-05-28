import { loadOwnClientProfile } from "../clientPortal.js";
import { loadClientAgenda } from "../calendar.js";

export async function renderClientPortal(supabase, state) {
  const app = document.getElementById("app");

  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="topbar site-top">
      <div class="site-brand">
        <img class="site-logo" src="/logo.svg" alt="Stichting logo">
        <div class="site-title">Stichting</div>
      </div>
      <button id="sidebarToggle" class="btn sidebar-toggle">☰</button>

      <div id="userMeta">
        ${state.profile.email}
      </div>

      <button id="logoutBtn">Logout</button>
    </div>

    <main class="client-portal-grid">
      <section id="chatList" class="client-portal-main">Laden...</section>
      <aside id="clientAgenda" class="client-portal-aside">
        <div class="card"><p>Laden agenda...</p></div>
      </aside>
    </main>
  `;

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      location.reload();
    };
  }

  await loadOwnClientProfile(supabase, state.profile);
  await loadClientAgenda(supabase, state.profile);
}
