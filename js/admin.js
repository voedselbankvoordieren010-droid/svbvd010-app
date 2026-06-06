import { openUserModal } from "./admin/userModal.js";

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
  value="vrijwilliger"
  ${
    safeRole === "vrijwilliger"
      ? "selected"
      : ""
  }
>
  Vrijwilliger
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
    safeRole === "hulpverlener"
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
          user,
          async () => {
            await loadUsers(supabase, state);
          }
        );
      };
  });
}

