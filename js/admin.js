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
export async function loadUsers(
  supabase,
  state
) {

  const list =
    document.getElementById(
      "userList"
    );

  if (!list) return;

  const {
    data: users,
    error
  } = await supabase
    .from("profiles")
    .select("*")
    .order(
      "created_at",
      { ascending: false }
    );

  if (error) {

    console.error(
      "Users error:",
      error
    );

    list.innerHTML =
      "Fout bij laden";

    return;
  }

  // stats
  const total =
    document.getElementById(
      "adminTotal"
    );

  if (total) {
    total.textContent =
      users.length;
  }

  const pending =
    document.getElementById(
      "adminPending"
    );

  if (pending) {

    pending.textContent =
      users.filter(
        u => !u.approved
      ).length;
  }

  const approved =
    document.getElementById(
      "adminApproved"
    );

  if (approved) {

    approved.textContent =
      users.filter(
        u => u.approved
      ).length;
  }

  // leeg
  if (!users.length) {

    list.innerHTML = `
      <div class="card">
        Geen gebruikers gevonden
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  // render
  users.forEach(user => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "user-card";

    const avatar =
      user.full_name
        ? user.full_name
            .charAt(0)
            .toUpperCase()
        : "?";

    card.innerHTML = `

      <div class="user-top">

        <div class="avatar">
          ${avatar}
        </div>

        <div>

          <b>
            ${user.full_name || "Onbekend"}
          </b>

          <br>

          <small>
            ${user.email || "-"}
          </small>

        </div>

      </div>

      <div>

        <span class="
          badge
          ${user.role === "admin"
            ? "admin"
            : "user"}
        ">
          ${user.role || "user"}
        </span>

        ${
          !user.approved
            ? `
              <span class="
                badge
                pending
              ">
                Wacht
              </span>
            `
            : ""
        }

      </div>

      <div class="actions">

        ${
          !user.approved
            ? `
              <button
                class="btn approve"
                data-id="${user.id}"
              >
                Goedkeuren
              </button>
            `
            : ""
        }

      </div>

    `;

    list.appendChild(card);
  });

  // approve
  document
    .querySelectorAll(
      ".approve"
    )
    .forEach(btn => {

      btn.onclick =
        async () => {

          const id =
            btn.dataset.id;

          const {
            error
          } = await supabase
            .from("profiles")
            .update({
              approved: true,
              role: "hulpverlener"
            })
            .eq("id", id);

          if (error) {

            console.error(
              error
            );

            alert(
              "Goedkeuren mislukt"
            );

            return;
          }

          await loadUsers(
            supabase,
            state
          );
        };
    });
}