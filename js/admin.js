export async function loadUsers(
  supabase,
  state
) {

  if (
    state.profile.role !==
    "admin"
  ) {

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

  container.innerHTML =
    "<p>Laden...</p>";

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

  if (error) {

    container.innerHTML = `
      <p>Fout bij laden users</p>
    `;

    return;
  }

  if (!data?.length) {

    container.innerHTML = `
      <p>Geen gebruikers gevonden</p>
    `;

    return;
  }

  // stats
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

  // cards render
  container.innerHTML =
    data.map(user => `

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
            ${user.role}
          "
        >
          ${user.role || "-"}
        </div>

        <p>
          ${
            user.approved
              ? "✅ Goedgekeurd"
              : "⏳ Wachtend"
          }
        </p>

      </div>

    `).join("");

  // click events
  const cards =
    document.querySelectorAll(
      ".admin-user-card"
    );

  console.log(
    "ADMIN CARDS:",
    cards.length
  );

  cards.forEach(card => {

    card.addEventListener(
      "click",
      async () => {

        const userId =
          card.dataset.userId;

        const user =
          data.find(
            u => u.id === userId
          );

        if (!user) return;

        openUserModal(
          supabase,
          state,
          user
        );
      }
    );
  });
}

function openUserModal(
  supabase,
  state,
  user
) {

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
        ${user.email}
      </p>

      <select id="editRole">

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

  document
    .getElementById(
      "closeUserBtn"
    )
    .onclick = () => {

      modal.remove();
    };

  document
    .getElementById(
      "saveUserBtn"
    )
    .onclick = async () => {

      const role =
        document.getElementById(
          "editRole"
        ).value;

      const approved =
        document.getElementById(
          "editApproved"
        ).checked;

      const { error } =
        await supabase
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

        alert(
          error.message
        );

        return;
      }

      modal.remove();

      loadUsers(
        supabase,
        state
      );
    };
}