import "./styles.css";


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
  loadClients,
  initClientModal
} from "./clients.js";

import {
  loadOwnClientProfile
} from "./clientPortal";


import {
  loginWithGoogle
} from "./auth.js";


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

        console.log(
          "GOOGLE LOGIN CLICK"
        );

        await loginWithGoogle(
          supabase
        );
      };
  }
}

async function init() {
document.body.style.visibility =
    "hidden";


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
const role =
    state.profile.role;

  // CLIENT PORTAL
if (role === "client") {

  const app =
  document.getElementById(
    "app"
  );

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

  document
    .getElementById(
      "logoutBtn"
    )
    .onclick = async () => {

      await supabase.auth.signOut();

      location.reload();
    };

  await loadOwnClientProfile(
    supabase,
    state.profile
  );

  document.body.style.visibility =
    "visible";

  return;
}


  const canViewClients =
    [
      "admin",
      "hulpverlener",
      "intake"
    ].includes(role);

  const canViewAdmin =
    role === "admin";

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
   document.body.style.visibility =
    "visible";


  console.log("APP READY");
}

// START
document.addEventListener(
  "DOMContentLoaded",
  init
); 