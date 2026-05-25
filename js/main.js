import "../styles.css";

import { supabase } from "./supabase.js";

import {
  checkSession,
  loadProfile,
  loginWithGoogle
} from "./auth.js";

import {
  initChat
} from "./chat.js";

import {
  loadNotifications
} from "./notifications.js";

import {
  loadUsers
} from "./admin.js";

import {
  loadClients
} from "./clients/index.js";

import {
  loadOwnClientProfile
} from "./clientPortal.js";

console.log("MAIN STARTED");

const state = {
  session: null,
  profile: null
};

window.supabase = supabase;
window.state = state;

// GLOBAL ERRORS
window.addEventListener(
  "error",
  e => {

    console.error(
      "GLOBAL ERROR:",
      e.error
    );
  }
);

// LOGIN SCREEN
async function showLogin() {

  const app =
    document.getElementById(
      "app"
    );

  if (!app) {
    return;
  }

  app.innerHTML = `

    <div class="login-screen">

      <div class="login-card">

        <h1>
          SVBVD010
        </h1>

        <button id="loginBtn">
          Inloggen met Microsoft
        </button>

        <button id="googleLoginBtn">
          Inloggen met Google
        </button>

      </div>

    </div>
  `;

  // MICROSOFT LOGIN
  const loginBtn =
    document.getElementById(
      "loginBtn"
    );

  if (loginBtn) {

    loginBtn.onclick =
      async () => {

        const {
          error
        } = await supabase
          .auth
          .signInWithOAuth({

            provider: "azure"
          });

        if (error) {

          console.error(
            "MICROSOFT LOGIN ERROR:",
            error
          );
        }
      };
  }

  // GOOGLE LOGIN
  const googleBtn =
    document.getElementById(
      "googleLoginBtn"
    );

  if (googleBtn) {

    googleBtn.onclick =
      async () => {

        await loginWithGoogle(
          supabase
        );
      };
  }
}

// CLIENT PORTAL
async function renderClientPortal() {

  const app =
    document.getElementById(
      "app"
    );

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

  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );

  if (logoutBtn) {

    logoutBtn.onclick =
      async () => {

        await supabase
          .auth
          .signOut();

        location.reload();
      };
  }

  await loadOwnClientProfile(
    supabase,
    state.profile
  );
}

// ADMIN DASHBOARD
async function renderDashboard() {

  const app =
    document.getElementById(
      "app"
    );

  if (!app) {
    return;
  }

  app.innerHTML = `

<div class="dashboard-layout">

  <!-- SIDEBAR -->

  <aside class="sidebar">

    <h1 class="logo">
      SVBVD010
    </h1>

    <nav class="sidebar-nav">

      <button
  class="
    tab-button
    btn
    is-active
  "
  data-tab="dashboard"
>
  Dashboard
</button>

      <button
  class="
    tab-button
    btn
  "
  data-tab="users"
>
  Gebruikers
</button>

<button
  class="
    tab-button
    btn
  "
  data-tab="chat"
>
  Chat
</button>

<button
  class="
    tab-button
    btn
  "
  data-tab="clients"
>
  Cliënten
</button>

    </nav>

  </aside>

  <!-- MAIN -->

  <main class="main-content">

    <!-- TOPBAR -->

    <div class="topbar">

      <div id="userMeta">

        ${state.profile.email}

      </div>

      <div class="topbar-right">

        <div class="notif-wrapper">

          <button
  id="notifBell"
  class="
    tab-button
    btn
  "
>
  🔔

  <span id="notifCount">
  </span>

</button>

          <div id="notifications">
          </div>

        </div>

        <button
  id="logoutBtn"
  class="btn"
>
  Uitloggen
</button>

      </div>

    </div>

    <!-- DASHBOARD -->

    <section
      id="dashboard"
      class="tab-panel"
    >

      <h1>
        Dashboard
      </h1>

      <div class="cards">

        <div class="card">
          Nieuw
        </div>

        <div class="card">
          Intake
        </div>

        <div class="card">
          Spoed
        </div>

      </div>

    </section>

    <!-- USERS -->

    <section
      id="users"
      class="
        tab-panel
        hidden
      "
    >

      <h1>
        Gebruikers
      </h1>

      <div id="userList">
      </div>

    </section>

    <!-- CHAT -->

    <section
      id="chat"
      class="
        tab-panel
        hidden
      "
    >

      <div id="chatList">
      </div>

    </section>

        <!-- CLIENTS -->

    <section
      id="clients"
      class="
        tab-panel
        hidden
      "
    >
    </section>

  </main>

</div>
`;

  const role =
    state.profile?.role;

  const canViewClients =
    [
      "admin",
      "hulpverlener",
      "intake"
    ].includes(role);

  const canViewAdmin =
    role === "admin";

  // NOTIFICATIONS
  await loadNotifications(
    supabase,
    state
  );

  // CHAT
  const chat =
    initChat(
      supabase,
      state
    );

  if (
    chat &&
    chat.init
  ) {

    chat.init();
  }

  // ADMIN TAB
  if (!canViewAdmin) {

    const adminBtn =
      document.querySelector(
        '[data-tab="admin"]'
      );

    if (adminBtn) {

      adminBtn.remove();
    }
  }

  // CLIENT TAB
  if (!canViewClients) {

    const clientsBtn =
      document.querySelector(
        '[data-tab="clients"]'
      );

    if (clientsBtn) {

      clientsBtn.remove();
    }
  }

  // NOTIFICATIONS UI
  const notifBell =
    document.getElementById(
      "notifBell"
    );

  const notifBox =
    document.getElementById(
      "notifications"
    );

  if (
    notifBell &&
    notifBox
  ) {

    notifBell.addEventListener(
      "click",
      () => {

        notifBox.style.display =
          notifBox.style.display ===
          "block"
            ? "none"
            : "block";
      }
    );
  }

  // LOGOUT
  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );

  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        await supabase
          .auth
          .signOut();

        location.reload();
      }
    );
  }

  // TABS
  document
    .querySelectorAll(
      ".tab-button"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          // ACTIVE BUTTON
          document
            .querySelectorAll(
              ".tab-button"
            )
            .forEach(b =>
              b.classList.remove(
                "is-active"
              )
            );

          btn.classList.add(
            "is-active"
          );

          // HIDE PANELS
          document
            .querySelectorAll(
              ".tab-panel"
            )
            .forEach(panel =>
              panel.classList.add(
                "hidden"
              )
            );

          // SHOW PANEL
          const panel =
            document.getElementById(
              btn.dataset.tab
            );

          if (panel) {

            panel.classList.remove(
              "hidden"
            );
          }

          // ADMIN
          if (
            btn.dataset.tab ===
            "users"
          ) {

            loadUsers(
              supabase,
              state
            );
          }

          // CLIENTS
          if (
            btn.dataset.tab ===
            "clients"
          ) {

            loadClients(
              supabase,
              state
            );
          }

          // CHAT
          if (
            btn.dataset.tab ===
            "chat"
          ) {

            if (
              chat &&
              chat.loadMessages
            ) {

              chat.loadMessages();
            }
          }
        }
      );
    });
}

// INIT
async function init() {

  console.log(
    "INIT START"
  );
  await new Promise(
  resolve =>
    setTimeout(resolve, 1000)
);

  // REMOVE ACCESS TOKEN FROM URL
  const hash =
    window.location.hash;

  if (
    hash &&
    hash.includes(
      "access_token"
    )
  ) {

    window.history.replaceState(
      null,
      null,
      window.location.pathname +
      window.location.search
    );
  }

  // SESSION
  const hasSession =
    await checkSession(
      supabase,
      state
    );

  if (!hasSession) {

    await showLogin();

    return;
  }

  // PROFILE
  const profileLoaded =
    await loadProfile(
      supabase,
      state
    );

  if (!profileLoaded) {

    console.error(
      "PROFILE FAILED"
    );

    return;
  }

  const role =
    state.profile?.role;

  // CLIENT
  if (role === "client") {

    await renderClientPortal();

    console.log(
      "CLIENT PORTAL READY"
    );

    return;
  }

  // ADMIN DASHBOARD
  await renderDashboard();

  console.log(
    "APP READY"
  );
}

// START
document.addEventListener(
  "DOMContentLoaded",
  init
);