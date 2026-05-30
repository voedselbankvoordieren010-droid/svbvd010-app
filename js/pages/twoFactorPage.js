export function showTwoFactorVerification(state) {
  const app = document.getElementById("app");

  if (!app) {
    return false;
  }

  const code =
    state.twoFactorCode ||
    String(Math.floor(100000 + Math.random() * 900000));

  state.twoFactorCode = code;

  app.innerHTML = `
    <div class="topbar site-top">
      <div class="site-brand">
        <img class="site-logo" src="/logo.svg" alt="Stichting logo">
        <div class="site-title">SVBVD010</div>
      </div>
    </div>

    <div class="login-screen">
      <div class="login-card">
        <h1>Tweestapsverificatie</h1>
        <p>Voer de verificatiecode in om verder te gaan.</p>
        <p class="info-text">In deze demo-use case is de code <strong>${code}</strong>.</p>
        <input id="twoFactorCodeInput" type="text" placeholder="123456" autocomplete="one-time-code" />
        <button id="verifyBtn">Verifiëren</button>
        <button id="resendBtn" class="secondary">Nieuwe code</button>
        <p id="twoFactorError" class="error-text hidden"></p>
      </div>
    </div>
  `;

  return new Promise(resolve => {
    const verifyBtn = document.getElementById("verifyBtn");
    const resendBtn = document.getElementById("resendBtn");
    const codeInput = document.getElementById("twoFactorCodeInput");
    const errorText = document.getElementById("twoFactorError");

    const showError = message => {
      if (!errorText) {
        return;
      }
      errorText.textContent = message;
      errorText.classList.remove("hidden");
    };

    if (verifyBtn && codeInput) {
      verifyBtn.addEventListener("click", () => {
        const userValue = codeInput.value.trim();

        if (userValue === state.twoFactorCode) {
          state.twoFactorVerified = true;
          resolve(true);
          return;
        }

        showError("Onjuiste code. Probeer het opnieuw.");
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", () => {
        const newCode = String(Math.floor(100000 + Math.random() * 900000));
        state.twoFactorCode = newCode;
        const info = document.querySelector(".info-text");
        if (info) {
          info.innerHTML = `In deze demo-use case is de code <strong>${newCode}</strong>.`;
        }
        if (errorText) {
          errorText.classList.add("hidden");
        }
      });
    }
  });
}
