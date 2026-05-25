export async function loadUsers(
  supabase,
  state
) {

  // ALLEEN ADMIN
  if (
    state.profile?.role !==
    "admin"
  ) {

    console.warn(
      "GEEN ADMIN"
    );

    return;
  }

  console.log(
    "LOAD USERS START"
  );

  const container =
    document.getElementById(
      "userList"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <p>Laden...</p>
  `;

  // USERS OPHALEN
  const {
    data,
    error
  } = await supabase
    .from("profiles")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  console.log(
    "USERS DATA:",
    data
  );

  console.log(
    "USERS ERROR:",
    error
  );

  // ERROR
  if (error) {

    console.error(error);

    container.innerHTML = `

      <p>
        Fout bij laden users
      </p>

    `;

    return;
  }

  // GEEN USERS
  if (!data?.length) {

    container.innerHTML = `

      <p>
        Geen gebruikers gevonden
      </p>

    `;

    return;
  }

  // STATS
  const total =
    document.getElementById(
      "adminTotal"
    );

  const approved =
    document.getElementById(
      "adminApproved"
    );

  const pending =
    document.getElementById(
      "adminPending"
    );

  if (total) {

    total.textContent =
      data.length;
  }

  if (approved) {

    approved.textContent =
      data.filter(
        u => u.approved
      ).length;
  }

  if (pending) {

    pending.textContent =
      data.filter(
        u => !u.approved
      ).length;
  }

  // RENDER
  container.innerHTML =
    data.map(user => {

      const safeRole =
        user.role || "client";

      return `

        <div
          class="
            client-card
            admin-user-card
          "
          data-user-id="${user.id}"
        >

          <h3>
            ${user.full_name || "-"}
          </h3>

          <p>
            ${user.email || "-"}
          </p>

          <div
            class="
              role-badge
              ${safeRole}
            "
          >

            ${safeRole}

          </div>

          <div class="admin-actions">

  <p>

    ${
      user.approved
        ? "✅ Goedgekeurd"
        : "⏳ Wachtend"
    }

  </p>

  ${
    !user.approved
      ? `

        <button
          class="approve-user-btn"
          data-user-id="${user.id}"
        >
          Goedkeuren
        </button>

      `
      : ""
  }

  <select
    class="role-select"
    data-user-id="${user.id}"
  >

    <option
      value="client"
      ${
        safeRole === "client"
          ? "selected"
          : ""
      }
    >
      Client
    </option>

    <option
      value="intake"
      ${
        safeRole === "intake"
          ? "selected"
          : ""
      }
    >
      Intake
    </option>

    <option
      value="hulpverlener"
      ${
        safeRole ===
        "hulpverlener"
          ? "selected"
          : ""
      }
    >
      Hulpverlener
    </option>

    <option
      value="admin"
      ${
        safeRole === "admin"
          ? "selected"
          : ""
      }
    >
      Admin
    </option>

  </select>

</div>

        </div>

      `;
    }).join("");

  // EVENTS
  const cards =
    document.querySelectorAll(
      ".admin-user-card"
    );

  console.log(
    "ADMIN CARDS:",
    cards.length
  );

  cards.forEach(card => {
      // APPROVE BUTTONS

document
  .querySelectorAll(
    ".approve-user-btn"
  )
  .forEach(btn => {

    btn.onclick =
      async e => {

        e.stopPropagation();

        const userId =
          btn.dataset.userId;

        const {
          error
        } = await supabase
          .from("profiles")
          .update({

            approved: true

          })
          .eq(
            "id",
            userId
          );

        if (error) {

          console.error(error);

          alert(
            error.message
          );

          return;
        }

        loadUsers(
          supabase,
          state
        );
      };
  });


// ROLE SELECTS

document
  .querySelectorAll(
    ".role-select"
  )
  .forEach(select => {

    select.onchange =
      async e => {

        e.stopPropagation();

        const userId =
          select.dataset.userId;

        const role =
          select.value;

        const {
          error
        } = await supabase
          .from("profiles")
          .update({

            role

          })
          .eq(
            "id",
            userId
          );

        if (error) {

          console.error(error);

          alert(
            error.message
          );

          return;
        }

        loadUsers(
          supabase,
          state
        );
      };
  });
    card.onclick =
      () => {

        const userId =
          card.dataset.userId;

        const user =
          data.find(
            u => u.id === userId
          );

        if (!user) {
          return;
        }

        openUserModal(
          supabase,
          state,
          user
        );
      };
  });
}

function openUserModal(
  supabase,
  state,
  user
) {

  // BESTAANDE MODAL WEG
  const existing =
    document.querySelector(
      ".modal-overlay"
    );

  if (existing) {
    existing.remove();
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "modal-overlay";

  modal.innerHTML = `

    <div class="modal">

      <h2>
        Gebruiker beheren
      </h2>

      <p>
        ${user.email || "-"}
      </p>

      <select id="editRole">

        <option
          value="client"
          ${
            user.role === "client"
              ? "selected"
              : ""
          }
        >
          client
        </option>

        <option
          value="vrijwilliger"
          ${
            user.role ===
            "vrijwilliger"
              ? "selected"
              : ""
          }
        >
          vrijwilliger
        </option>

        <option
          value="hulpverlener"
          ${
            user.role ===
            "hulpverlener"
              ? "selected"
              : ""
          }
        >
          hulpverlener
        </option>

        <option
          value="intake"
          ${
            user.role ===
            "intake"
              ? "selected"
              : ""
          }
        >
          intake
        </option>

        <option
          value="admin"
          ${
            user.role ===
            "admin"
              ? "selected"
              : ""
          }
        >
          admin
        </option>

      </select>

      <label
        style="
          display:flex;
          gap:10px;
          margin-top:20px;
        "
      >

        <input
          id="editApproved"
          type="checkbox"
          ${
            user.approved
              ? "checked"
              : ""
          }
        >

        Goedgekeurd

      </label>

      <div class="modal-actions">

        <button id="saveUserBtn">
          Opslaan
        </button>

        <button id="closeUserBtn">
          Sluiten
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  // SLUITEN
  const closeBtn =
    document.getElementById(
      "closeUserBtn"
    );

  if (closeBtn) {

    closeBtn.onclick =
      () => {

        modal.remove();
      };
  }

  // OPSLAAN
  const saveBtn =
    document.getElementById(
      "saveUserBtn"
    );

  if (saveBtn) {

    saveBtn.onclick =
      async () => {

        saveBtn.disabled =
          true;

        const role =
          document.getElementById(
            "editRole"
          )?.value || "client";

        const approved =
          document.getElementById(
            "editApproved"
          )?.checked || false;

        // ROLE VALIDATIE
        const validRoles =
          [
            "client",
            "vrijwilliger",
            "hulpverlener",
            "intake",
            "admin"
          ];

        if (
          !validRoles.includes(
            role
          )
        ) {

          alert(
            "Ongeldige role"
          );

          saveBtn.disabled =
            false;

          return;
        }

        // UPDATE
        const {
          error
        } = await supabase
          .from("profiles")
          .update({

            role,
            approved
          })
          .eq(
            "id",
            user.id
          );

        if (error) {

          console.error(
            error
          );

          alert(
            error.message
          );

          saveBtn.disabled =
            false;

          return;
        }

        modal.remove();

        await loadUsers(
          supabase,
          state
        );
      };
  }
}
