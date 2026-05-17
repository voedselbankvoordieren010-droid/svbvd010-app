import "./css/styles.css";

import {
  login,
  logout,
  getSession
} from "./js/auth";

import {
  ensureProfile,
  getProfile
} from "./js/profile";

import {
  getUsers
} from "./js/users";

import {
  getMessages,
  sendMessage,
  createConversation
} from "./js/chat";

import {
  getClients,
  getClientStats
} from "./js/clients";

import {
  getAnimals
} from "./js/animals";

import { supabase } from "./js/supabase";

async function startApp() {

  const session =
    await getSession();

  if (session) {

    await ensureProfile(
      session.user
    );

    renderDashboard(session);

  } else {

    renderLogin();
  }
}

function renderLogin() {

  document.querySelector("#app")
    .innerHTML = `

      <div class="container">

        <h1>SVBVD010 PRO</h1>

        <p>Log in met Microsoft</p>

        <button id="loginBtn">
          Inloggen
        </button>

      </div>

    `;

  document
    .querySelector("#loginBtn")
    .addEventListener(
      "click",
      login
    );
}

async function renderDashboard(
  session
) {

  const profile =
    await getProfile(
      session.user.id
    );

  document.querySelector("#app")
    .innerHTML = `

      <div class="app">

        <aside class="sidebar">

          <div class="logo">
            SVBVD010
          </div>

          <nav class="nav">

            <button id="dashboardBtn">
              Dashboard
            </button>

            ${profile.role === "admin" ? `

              <button id="usersBtn">
                Gebruikers
              </button>

            ` : ""}

            <button id="chatBtn">
              Chat
            </button>

            <button id="clientsBtn">
              Cliënten
            </button>

          </nav>

        </aside>

        <main class="main">

          <div class="topbar">

            <h1>Dashboard</h1>

            <div class="user-box">
              ${session.user.email}
            </div>

          </div>

          <div
            class="cards"
            id="dashboardCards"
          >

            Laden...

          </div>

          <button
            id="logoutBtn"
            class="logout-btn"
          >
            Uitloggen
          </button>

        </main>

      </div>

    `;

  document
    .querySelector("#logoutBtn")
    .addEventListener(
      "click",
      logout
    );

  document
    .querySelector("#dashboardBtn")
    .addEventListener(
      "click",
      async () => {

  await renderDashboard(session);
}
    );

  document
    .querySelector("#chatBtn")
    .addEventListener(
      "click",
      () => renderChat()
    );

  document
  .querySelector("#clientsBtn")
  .addEventListener(
    "click",
    async () => {

      alert("clients clicked");

      await renderClients(session);
    }
  );

      document.querySelector(
        ".topbar h1"
      ).innerText = "Cliënten";

      await renderClients(session);
    }
  );

  document
    .querySelector("#usersBtn")
    ?.addEventListener(
      "click",
      () => renderUsers(session)
    );

  loadClientDashboard(session);
}

async function renderUsers(
  session
) {

  const users =
    await getUsers();

  const filteredUsers =
    users.filter(
      user =>
        user.id !== session.user.id
    );

  const html =
    filteredUsers.map(user => `

      <div
        class="card user-card"
        data-user="${user.id}"
      >

        <h3>
          ${user.full_name || "Geen naam"}
        </h3>

        <p>
          ${user.email || ""}
        </p>

      </div>

    `).join("");

  document.querySelector(".cards")
    .innerHTML = html;

  document
    .querySelectorAll(".user-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        async () => {

          const targetUserId =
            card.dataset.user;

          const conversation =
            await createConversation([
              session.user.id,
              targetUserId
            ]);

          renderConversationChat(
            session,
            conversation.id
          );
        }
      );
    });
}

function renderChat() {

  document.querySelector(".cards")
    .innerHTML = `

      <div class="card">

        <h2>
          Kies een gebruiker via
          "Gebruikers"
          om privé te chatten
        </h2>

      </div>

    `;
}

async function renderConversationChat(
  session,
  conversationId
) {

  const messages =
    await getMessages();

  const filtered =
    messages.filter(
      msg =>
        msg.conversation_id === conversationId
    );

  const html =
    filtered.map(msg => `

      <div class="card">

        <h3>
          ${msg.user_email || ""}
        </h3>

        <p>
          ${msg.bericht}
        </p>

      </div>

    `).join("");

  document.querySelector(".cards")
    .innerHTML = `

      <div class="chat-box">

        <h2>
          Privégesprek
        </h2>

        ${html}

        <div class="chat-send">

          <input
            type="text"
            id="messageInput"
            placeholder="Typ een bericht..."
          >

          <button id="sendBtn">
            Verstuur
          </button>

        </div>

      </div>

    `;

  document
    .querySelector("#sendBtn")
    .addEventListener(
      "click",
      async () => {

        const input =
          document.querySelector(
            "#messageInput"
          );

        if (!input.value) return;

        await sendMessage(
          session.user,
          input.value,
          conversationId
        );

        input.value = "";

        renderConversationChat(
          session,
          conversationId
        );
      }
    );
}

async function renderClients(
  session
) {

  const profile =
    await getProfile(
      session.user.id
    );

  const clients =
    await getClients(
      profile.organization_id
    );

  const searchHtml = `

    <div class="card">

      <input
        type="text"
        id="clientSearch"
        placeholder="Zoek cliënt..."
      >

      <select id="statusFilter">

        <option value="all">
          Alle statussen
        </option>

        <option value="nieuw">
          Nieuw
        </option>

        <option value="intake">
          Intake
        </option>

        <option value="behandeling">
          In behandeling
        </option>

        <option value="spoed">
          Spoed
        </option>

        <option value="afgerond">
          Afgerond
        </option>

      </select>

      <button id="newClientBtn">
        Nieuwe cliënt
      </button>

    </div>

  `;

  const html =
    clients.map(client => `

      <div
        class="card client-card"
        data-client="${client.id}"
      >

        <h3>
          ${client.full_name || ""}
        </h3>

        <p>
          ${client.email || ""}
        </p>

        <p>
          ${client.phone || ""}
        </p>

        <p class="client-status">
          ${client.status || "nieuw"}
        </p>

      </div>

    `).join("");

  document.querySelector(".cards")
    .innerHTML =
      searchHtml + html;

  document
    .querySelectorAll(".client-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          renderClientDetail(
            session,
            card.dataset.client
          );
        }
      );
    });

  document
    .querySelector("#newClientBtn")
    ?.addEventListener(
      "click",
      () => renderNewClientForm(session)
    );

  const searchInput =
    document.querySelector(
      "#clientSearch"
    );

  const statusFilter =
    document.querySelector(
      "#statusFilter"
    );

  function filterClients() {

    const search =
      searchInput.value
        .toLowerCase();

    const status =
      statusFilter.value;

    document
      .querySelectorAll(
        ".client-card"
      )
      .forEach(card => {

        const text =
          card.innerText
            .toLowerCase();

        const statusText =
          card.querySelector(
            ".client-status"
          )
          ?.innerText
          .toLowerCase() || "";

        const matchesSearch =
          text.includes(search);

        const matchesStatus =
          status === "all"
          || statusText.includes(status);

        card.style.display =
          matchesSearch
          && matchesStatus
            ? "block"
            : "none";
      });
  }

  searchInput
    .addEventListener(
      "input",
      filterClients
    );

  statusFilter
    .addEventListener(
      "change",
      filterClients
    );
}

async function renderNewClientForm(
  session
) {

  document.querySelector(".cards")
    .innerHTML = `

      <div class="card">

        <h2>
          Nieuwe cliënt
        </h2>

        <input
          type="text"
          id="newFullName"
          placeholder="Naam"
        >

        <input
          type="text"
          id="newPhone"
          placeholder="Telefoon"
        >

        <input
          type="email"
          id="newEmail"
          placeholder="E-mail"
        >

        <select id="newStatus">

          <option value="nieuw">
            Nieuw
          </option>

          <option value="intake">
            Intake
          </option>

          <option value="behandeling">
            In behandeling
          </option>

        </select>

        <button id="saveNewClientBtn">
          Opslaan
        </button>

      </div>

    `;

  document
    .querySelector("#saveNewClientBtn")
    .addEventListener(
      "click",
      async () => {

        const profile =
          await getProfile(
            session.user.id
          );

        const full_name =
          document.querySelector(
            "#newFullName"
          ).value;

        const phone =
          document.querySelector(
            "#newPhone"
          ).value;

        const email =
          document.querySelector(
            "#newEmail"
          ).value;

        const status =
          document.querySelector(
            "#newStatus"
          ).value;

        const { error } =
          await supabase
            .from("clients")
            .insert([
              {
                full_name,
                phone,
                email,
                status,
                organization_id:
                  profile.organization_id,
                created_by:
                  session.user.id
              }
            ]);

        if (error) {

          console.error(error);

          alert(
            "Fout bij opslaan"
          );

          return;
        }

        alert(
          "Cliënt toegevoegd"
        );

        renderClients(session);
      }
    );
}

async function renderClientDetail(
  session,
  clientId
) {

  const profile =
    await getProfile(
      session.user.id
    );

  const clients =
    await getClients(
      profile.organization_id
    );

  const client =
    clients.find(
      c => c.id === clientId
    );

  if (!client) {

    document.querySelector(".cards")
      .innerHTML = `

        <div class="card">

          <h2>
            Cliënt niet gevonden
          </h2>

        </div>

      `;

    return;
  }

  const animals =
    await getAnimals(clientId);

  const animalsHtml =
    animals.map(animal => `

      <div class="card">

        <h3>
          ${animal.name}
        </h3>

        <p>
          Type:
          ${animal.type || ""}
        </p>

        <p>
          Ras:
          ${animal.breed || ""}
        </p>

        <p>
          Leeftijd:
          ${animal.age || ""}
        </p>

        <p>
          Chip:
          ${animal.chip_number || ""}
        </p>

      </div>

    `).join("");

  document.querySelector(".cards")
    .innerHTML = `

      <div class="warning-box">

        LET OP:
        Nieuwe dieren aanmelden tijdens
        hulptraject is NIET toegestaan.

        Bij overtreding kan hulp direct
        worden stopgezet.

      </div>

      <div class="card">

        <h2>
          ${client.full_name}
        </h2>

        <p>
          ${client.email || ""}
        </p>

        <p>
          ${client.phone || ""}
        </p>

        <p>
          Status:
          ${client.status || "nieuw"}
        </p>

      </div>

      <div class="card">

        <h2>
          Dieren
        </h2>

        ${animalsHtml || `
          <p>
            Geen dieren gekoppeld
          </p>
        `}

      </div>

    `;
}

async function loadClientDashboard(
  session
) {

  const profile =
    await getProfile(
      session.user.id
    );

  const stats =
    await getClientStats(
      profile.organization_id
    );

  const dashboard =
    document.querySelector(
      "#dashboardCards"
    );

  if (!dashboard) return;

  dashboard.innerHTML = `

    <div class="card">
      <h3>Nieuw</h3>
      <p>${stats.nieuw}</p>
    </div>

    <div class="card">
      <h3>Intake</h3>
      <p>${stats.intake}</p>
    </div>

    <div class="card">
      <h3>In behandeling</h3>
      <p>${stats.behandeling}</p>
    </div>

    <div class="card">
      <h3>Spoed</h3>
      <p>${stats.spoed}</p>
    </div>

    <div class="card">
      <h3>Afgerond</h3>
      <p>${stats.afgerond}</p>
    </div>

  `;
}

startApp();