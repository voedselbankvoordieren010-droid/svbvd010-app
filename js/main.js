import "../styles.css";

import { supabase } from "./supabase.js";

import {
  checkSession,
  loadProfile
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
  initClientModal
} from "./clients.js";

console.log("MAIN STARTED");

const state = {
  session: null,
  profile: null
};

window.supabase = supabase;
window.state = state;

window.addEventListener(
  "error",
  e => {
    console.error(
      "GLOBAL ERROR:",
      e.error
    );
  }
);

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

    </div>

  </div>
`;

const loginBtn =
  document.getElementById(
    "loginBtn"
  );

if (!loginBtn) {
  return;
}

loginBtn.onclick =
  async () => {

    const { error } =
      await supabase.auth
        .signInWithOAuth({
          provider: "azure"
        });

    if (error) {

      console.error(error);

    }
  };

}

async function init() {
await new Promise(
  resolve =>
    setTimeout(resolve, 1500)
);

  console.log("INIT START");

  // access token uit URL verwijderen
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
  const ok =
    await checkSession(
      supabase,
      state
    );

  if (!ok) {

    console.error(
      "GEEN SESSION"
    );

    await showLogin();

    return;
  }

  console.log(
    "SESSION OK",
    state.session
  );

  // PROFILE
  const profileOk =
    await loadProfile(
      supabase,
      state
    );

  if (!profileOk) {

    console.error(
      "PROFILE FAILED"
    );

    return;
  }

  console.log(
    "PROFILE OK",
    state.profile
  );

  // NOTIFICATIES
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

  // notificaties
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

  // logout
  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );

  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        await supabase.auth.signOut();

        window.location.reload();
      }
    );
  }

  // tabs
  document
    .querySelectorAll(
      ".tab-button"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          // active knop
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

          // panels verbergen
          document
            .querySelectorAll(
              ".tab-panel"
            )
            .forEach(panel =>
              panel.classList.add(
                "hidden"
              )
            );

          // juiste panel tonen
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
          }
            initClientModal(
              supabase,
               state
       );
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

  console.log("APP READY");
}

// START
document.addEventListener(
  "DOMContentLoaded",
  init
);