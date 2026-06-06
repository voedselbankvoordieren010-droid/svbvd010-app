import { loginWithGoogle } from "../auth.js";

export async function showLogin(supabase) {
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
    </div>

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

  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.onclick = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error("MICROSOFT LOGIN ERROR:", error);
      }
    };
  }

  const googleBtn = document.getElementById("googleLoginBtn");

  if (googleBtn) {
    googleBtn.onclick = async () => {
      await loginWithGoogle(supabase);
    };
  }
}
