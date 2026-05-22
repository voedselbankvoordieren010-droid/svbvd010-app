export function openEditClientModal(
  client,
  supabase,
  onSave = null
) {

  // BESTAANDE MODAL WEGHALEN
  const existing =
    document.querySelector(
      ".modal-overlay"
    );

  if (existing) {
    existing.remove();
  }

  // MODAL
  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "modal-overlay";

  const safeAnimals =
    Array.isArray(
      client.animals
    )
      ? client.animals.join("\n")
      : "";

  modal.innerHTML = `

    <div class="modal">

      <h2>
        Cliënt bewerken
      </h2>

      <input
        id="editName"
        placeholder="Naam"
        value="${client.full_name || ""}"
      >

      <input
        id="editEmail"
        placeholder="Email"
        value="${client.email || ""}"
      >

      <input
        id="editPhone"
        placeholder="Telefoon"
        value="${client.phone || ""}"
      >

      <input
        id="editAddress"
        placeholder="Adres"
        value="${client.address || ""}"
      >

      <input
        id="editPostal"
        placeholder="Postcode"
        value="${client.postal_code || ""}"
      >

      <textarea
        id="editAnimals"
        placeholder="Dieren"
      >${safeAnimals}</textarea>

      <textarea
        id="editNotes"
        placeholder="Notities"
      >${client.notes || ""}</textarea>

      <div class="modal-actions">

        <button id="saveEditBtn">
          Opslaan
        </button>

        <button id="closeEditBtn">
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
      "closeEditBtn"
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
      "saveEditBtn"
    );

  if (saveBtn) {

    saveBtn.onclick =
      async () => {

        saveBtn.disabled = true;

        const full_name =
          document.getElementById(
            "editName"
          )?.value?.trim() || "";

        const email =
          document.getElementById(
            "editEmail"
          )?.value?.trim() || "";

        const phone =
          document.getElementById(
            "editPhone"
          )?.value?.trim() || "";

        const address =
          document.getElementById(
            "editAddress"
          )?.value?.trim() || "";

        const postal_code =
          document.getElementById(
            "editPostal"
          )?.value?.trim() || "";

        const animals =
          document.getElementById(
            "editAnimals"
          )?.value
            ?.split("\n")
            .map(a => a.trim())
            .filter(Boolean) || [];

        const notes =
          document.getElementById(
            "editNotes"
          )?.value?.trim() || "";

        // UPDATE
        const {
          error
        } = await supabase
          .from("clients")
          .update({

            full_name,
            email,
            phone,
            address,
            postal_code,
            animals,
            notes
          })
          .eq(
            "id",
            client.id
          );

        if (error) {

          console.error(
            "UPDATE ERROR:",
            error
          );

          alert(
            error.message
          );

          saveBtn.disabled =
            false;

          return;
        }

        // CALLBACK
        if (
          typeof onSave ===
          "function"
        ) {

          await onSave();
        }

        modal.remove();
      };
  }
}
