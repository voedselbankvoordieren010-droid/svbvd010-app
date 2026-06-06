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
        <p id="loginError" class="error-text hidden"></p>

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
      clearError();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: "https://app.svbvd010.nl/"
        }
      });

      if (error) {
        console.error("MICROSOFT LOGIN ERROR:", error);
        showError("Login fout: " + (error.message || JSON.stringify(error)));
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    };
  }

  const googleBtn = document.getElementById("googleLoginBtn");

  function showError(msg) {
    const el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearError() {
    const el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = '';
    el.classList.add('hidden');
  }

  if (googleBtn) {
    googleBtn.onclick = async () => {
      clearError();
      const { data, error } = await loginWithGoogle(supabase);
      if (error) {
        console.error('GOOGLE LOGIN ERROR:', error);
        showError('Google login fout: ' + (error.message || ''));
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    };
  }
}
