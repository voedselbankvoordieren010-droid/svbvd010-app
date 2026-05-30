import "../css/main.css";

import { supabase } from "./supabase.js";
import { checkSession, loadProfile } from "./auth.js";
import { showLogin } from "./pages/loginPage.js";
import { renderClientPortal } from "./pages/clientPortalPage.js";
import { renderDashboard } from "./pages/dashboardPage.js";
import { showTwoFactorVerification } from "./pages/twoFactorPage.js";

console.log("MAIN STARTED");

const state = {
  session: null,
  profile: null
};

window.supabase = supabase;
window.state = state;

window.addEventListener("error", e => {
  console.error("GLOBAL ERROR:", e.error);
});

function requiresTwoFactor(profile) {
  return profile && ["client", "hulpverlener"].includes(profile.role);
}

async function routeAuthenticated() {
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

  await new Promise(resolve => setTimeout(resolve, 1000));

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

  if (requiresTwoFactor(state.profile) && !state.twoFactorVerified) {
    const verified = await showTwoFactorVerification(state);
    if (!verified) {
      console.error("TWO-FAILURE");
      return;
    }
  }

  await routeAuthenticated();
}

document.addEventListener("DOMContentLoaded", init);
