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
  loadClients,
  initClientModal
} from "./clients.js";

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
            "admin"
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

            initClientModal(
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