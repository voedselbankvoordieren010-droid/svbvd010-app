import "../css/main.css";

import { supabase } from "./supabase.js";
import { checkSession, loadProfile } from "./auth.js";
import { showLogin } from "./pages/loginPage.js";
import { renderClientPortal } from "./pages/clientPortalPage.js";
import { renderDashboard } from "./pages/dashboardPage.js";

console.log("MAIN STARTED");

const state = {
  session: null,
  profile: null
};

window.supabase = supabase;
window.state = state;

// Listen for auth state changes to handle OAuth redirects
supabase.auth.onAuthStateChange((event, session) => {
  console.log("AUTH EVENT:", event, session);
  if (event === "SIGNED_IN" && session) {
    state.session = session;
    (async () => {
      const profileLoaded = await loadProfile(supabase, state);
      if (profileLoaded) await routeAuthenticated();
    })();
  }
});
window.addEventListener("error", e => {
  console.error("GLOBAL ERROR:", e.error);
});

function fadeOutPreloader() {
  return new Promise(resolve => {
    const loader = document.querySelector(".app-preloader");
    if (!loader) {
      resolve();
      return;
    }

    const finish = () => {
      const app = document.getElementById("app");
      if (app && app.contains(loader)) {
        app.removeChild(loader);
      }
      resolve();
    };

    loader.classList.add("fade-out");
    loader.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 500);
  });
}

async function routeAuthenticated() {
  await fadeOutPreloader();

  const role = state.profile?.role;
  if (role === "client") {
    await renderClientPortal(supabase, state);
    console.log("CLIENT PORTAL READY");
    return;
  }

  await renderDashboard(supabase, state);
  console.log("APP READY");
}

async function init() {
  console.log("INIT START");

  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  const hasSession = await checkSession(supabase, state);
  if (!hasSession) {
    await showLogin(supabase);
    return;
  }

  const profileLoaded = await loadProfile(supabase, state);
  if (!profileLoaded) {
    console.error("PROFILE FAILED");
    return;
  }

  await routeAuthenticated();
}

document.addEventListener("DOMContentLoaded", init);
