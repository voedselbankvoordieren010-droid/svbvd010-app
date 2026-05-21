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
      <p>
        Fout bij laden users
      </p>
    `;

    return;
  }

  if (!data?.length) {

    container.innerHTML = `
      <p>
        Geen gebruikers gevonden
      </p>
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

  // cards
  container.innerHTML =
    data.map(user => `

      <div class="client-card">

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
}