export async function openUserModal(supabase, state, user, reloadUsers) {
  const existing = document.querySelector(".modal-overlay");
  if (existing) {
    existing.remove();
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <h2>
        Gebruiker beheren
      </h2>
      <p>
        ${user.email || "-"}
      </p>
      <select id="editRole">
        <option value="client" ${user.role === "client" ? "selected" : ""}>client</option>
        <option value="vrijwilliger" ${user.role === "vrijwilliger" ? "selected" : ""}>vrijwilliger</option>
        <option value="hulpverlener" ${user.role === "hulpverlener" ? "selected" : ""}>hulpverlener</option>
        <option value="intake" ${user.role === "intake" ? "selected" : ""}>intake</option>
        <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
      </select>
      <label style="display:flex;gap:10px;margin-top:20px;">
        <input id="editApproved" type="checkbox" ${user.approved ? "checked" : ""}>
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

  document.body.appendChild(modal);

  const closeBtn = document.getElementById("closeUserBtn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.remove();
    };
  }

  const saveBtn = document.getElementById("saveUserBtn");
  if (!saveBtn) {
    return;
  }

  saveBtn.onclick = async () => {
    saveBtn.disabled = true;

    const role = document.getElementById("editRole")?.value || "client";
    const approved = document.getElementById("editApproved")?.checked || false;

    const validRoles = ["client", "vrijwilliger", "hulpverlener", "intake", "admin"];
    if (!validRoles.includes(role)) {
      alert("Ongeldige role");
      saveBtn.disabled = false;
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role, approved })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert(error.message);
      saveBtn.disabled = false;
      return;
    }

    modal.remove();
    await reloadUsers?.();
  };
}
