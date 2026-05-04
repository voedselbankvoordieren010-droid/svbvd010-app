export async function loadUsers(supabase, state) {
  const list = document.getElementById("userList");
  if (!list) return; // 🔥 voorkomt crash als element niet bestaat

  const { data: users, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("Users error:", error);
    list.innerHTML = "Fout bij laden gebruikers";
    return;
  }

  list.innerHTML = "";

  // ✅ STATS (veilig)
  const total = document.getElementById("adminTotal");
  if (total) total.textContent = users.length;

  const pending = document.getElementById("adminPending");
  if (pending) pending.textContent = users.filter(u => !u.approved).length;

  const approved = document.getElementById("adminApproved");
  if (approved) approved.textContent = users.filter(u => u.approved).length;

  // ❗ geen data
  if (!users.length) {
    list.innerHTML = "<div class='card'>Geen gebruikers gevonden</div>";
    return;
  }

  // ✅ USERS RENDER
  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "user-card";

    const avatar = u.naam
      ? u.naam.charAt(0).toUpperCase()
      : "?";

    card.innerHTML = `
      <div class="user-top">
        <div class="avatar">${avatar}</div>
        <div>
          <b>${u.naam || "Onbekend"}</b><br>
          <small>${u.email || "-"}</small>
        </div>
      </div>

      <div>
        <span class="badge ${u.rol === "admin" ? "admin" : "user"}">
          ${u.rol || "user"}
        </span>
        ${
          !u.approved
            ? '<span class="badge pending">Wacht</span>'
            : ""
        }
      </div>

      <div class="actions">
        ${
          !u.approved
            ? `<button class="btn approve" data-id="${u.id}">Goedkeuren</button>`
            : ""
        }
        <button class="btn delete" data-id="${u.id}">Verwijder</button>
      </div>
    `;

    list.appendChild(card);
  });

  // ✅ APPROVE (met error handling)
  document.querySelectorAll(".approve").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      const { error } = await supabase
        .from("users")
        .update({ approved: true, rol: "hulpverlener" })
        .eq("id", id);

      if (error) {
        alert("Fout bij goedkeuren");
        console.error(error);
        return;
      }

      await loadUsers(supabase, state);
    };
  });

  // ✅ DELETE (veiliger)
  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      if (!confirm("Weet je het zeker?")) return;

      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Fout bij verwijderen");
        console.error(error);
        return;
      }

      await loadUsers(supabase, state);
    };
  });
}