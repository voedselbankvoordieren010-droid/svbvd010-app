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

  const ok = await checkSession(supabase, state);
  if (!ok) return;

  console.log("SESSION OK", state.session);

  const profileOk = await loadProfile(supabase, state);
  if (!profileOk) return;

  console.log("PROFILE OK", state.profile);

  await loadNotifications(supabase, state);

  const chat = initChat(supabase, state);
  chat.init();

  // 🔔 notificatie
  const notifBell = document.getElementById("notifBell");
  const notifBox = document.getElementById("notifications");

  notifBell.addEventListener("click", () => {
    notifBox.style.display =
      notifBox.style.display === "block" ? "none" : "block";
  });

  // 🚪 logout
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "./index.html";
  });

// 📑 tabs
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".tab-button")
      .forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    document.querySelectorAll(".tab-panel")
      .forEach(p => p.classList.add("hidden"));

    const panel = document.getElementById(btn.dataset.tab);
    if (panel) panel.classList.remove("hidden");

    if (btn.dataset.tab === "admin") {
      loadUsers(supabase, state);
    }

    if (btn.dataset.tab === "chat") {
      if (chat && chat.loadMessages) {
        chat.loadMessages();
      }
    }

  });
});
  console.log("APP READY");
}

document.addEventListener("DOMContentLoaded", init);

// 🔥 SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/app/service-worker.js")
      .then(() => console.log("✅ Service Worker actief"))
      .catch(err => console.error("❌ SW error:", err));
  });
}