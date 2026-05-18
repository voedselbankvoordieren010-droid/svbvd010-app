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

    console.error(error);

    list.innerHTML =
      "Fout bij laden";

    return;
  }

  if (!users?.length) {

    list.innerHTML = `
      <div class="card">
        Geen gebruikers
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  users.forEach(user => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "card";

    div.innerHTML = `

      <h3>
        ${user.full_name || "Onbekend"}
      </h3>

      <p>
        ${user.email || ""}
      </p>

      <br>

      <label>
        Rol
      </label>

      <select
        id="role-${user.id}"
      >

        <option
          value="client"
          ${user.role === "client"
            ? "selected"
            : ""}
        >
          client
        </option>

        <option
          value="vrijwilliger"
          ${user.role === "vrijwilliger"
            ? "selected"
            : ""}
        >
          vrijwilliger
        </option>

        <option
          value="hulpverlener"
          ${user.role === "hulpverlener"
            ? "selected"
            : ""}
        >
          hulpverlener
        </option>

        <option
          value="admin"
          ${user.role === "admin"
            ? "selected"
            : ""}
        >
          admin
        </option>

      </select>

      <br><br>

      <label>

        <input
          type="checkbox"
          id="approved-${user.id}"
          ${user.approved
            ? "checked"
            : ""}
        >

        Approved

      </label>

      <br><br>

      <button
        class="save-user-btn"
        data-id="${user.id}"
      >
        Opslaan
      </button>

    `;

    list.appendChild(div);
  });

  document
    .querySelectorAll(
      ".save-user-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async () => {

          const id =
            btn.dataset.id;

          const role =
            document.getElementById(
              `role-${id}`
            ).value;

          const approved =
            document.getElementById(
              `approved-${id}`
            ).checked;

          const {
            error
          } = await supabase
            .from("profiles")
            .update({
              role,
              approved
            })
            .eq("id", id);

          if (error) {

            console.error(
              error
            );

            alert(
              "Opslaan mislukt"
            );

            return;
          }

          alert(
            "Gebruiker opgeslagen"
          );
        }
      );
    });
}