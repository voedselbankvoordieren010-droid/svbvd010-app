import { loadOwnClientProfile } from "../clientPortal.js";

export async function renderClientPortal(supabase, state) {
  const app = document.getElementById("app");

  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="topbar">
      <div id="userMeta">
        ${state.profile.email}
      </div>
      <button id="logoutBtn">
        Logout
      </button>
    </div>

    <main class="tab-panel">
      <div id="chatList">
        Laden...
      </div>
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
}
