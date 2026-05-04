console.log("MAIN STARTED");

import { supabase } from "./supabase.js";
import { checkSession, loadProfile } from "./auth.js";
import { initChat } from "./chat.js";
import { loadNotifications } from "./notifications.js";
import { loadUsers } from "./admin.js";

const state = {
  session: null,
  profile: null
};

window.supabase = supabase;
window.state = state;

async function init() {
  console.log("INIT START");

  // 🔥 FIX: access_token uit URL halen
  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    window.history.replaceState(
      null,
      null,
      window.location.pathname + window.location.search
    );
  }

  // 🔐 SESSION
  const ok = await checkSession(supabase, state);
  if (!ok) return;

  console.log("SESSION OK", state.session);

  // 👤 PROFIEL
  const profileOk = await loadProfile(supabase, state);
  if (!profileOk) return;

  console.log("PROFILE OK", state.profile);

  // 🔔 NOTIFICATIES
  await loadNotifications(supabase, state);

  // 💬 CHAT INIT (1x!)
  const chat = initChat(supabase, state);
  chat.init();

  // 🔔 notificatie dropdown
  const notifBell = document.getElementById("notifBell");
  const notifBox = document.getElementById("notifications");

  if (notifBell && notifBox) {
    notifBell.addEventListener("click", () => {
      notifBox.style.display =
        notifBox.style.display === "block" ? "none" : "block";
    });
  }

  // 🚪 logout
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "./index.html";
    });
  }

  // 📑 TAB NAVIGATIE
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {

      // active knop
      document.querySelectorAll(".tab-button")
        .forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // panels verbergen
      document.querySelectorAll(".tab-panel")
        .forEach(p => p.classList.add("hidden"));

      // juiste panel tonen
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.remove("hidden");

      // 👥 ADMIN
      if (btn.dataset.tab === "admin") {
        loadUsers(supabase, state);
      }

      // 💬 CHAT → alleen berichten reloaden (GEEN dubbele init!)
      if (btn.dataset.tab === "chat") {
        if (chat && chat.loadMessages) {
          chat.loadMessages();
        }
      }

    });
  });

  console.log("APP READY");
}

// 🚀 START APP
document.addEventListener("DOMContentLoaded", init);

/*
// 🔥 SERVICE WORKER (later weer aanzetten)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/app/service-worker.js")
      .then(() => console.log("✅ Service Worker actief"))
      .catch(err => console.error("❌ SW error:", err));
  });
}
*/