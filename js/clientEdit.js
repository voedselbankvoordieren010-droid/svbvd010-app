export function openEditClientModal(
  client,
  supabase
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
        Cliënt bewerken
      </h2>

      <input
        id="editName"
        value="${client.full_name || ""}"
        placeholder="Naam"
      >

      <input
        id="editEmail"
        value="${client.email || ""}"
        placeholder="Email"
      >

      <input
        id="editPhone"
        value="${client.phone || ""}"
        placeholder="Telefoon"
      >

      <input
        id="editAddress"
        value="${client.address || ""}"
        placeholder="Adres"
      >

      <input
        id="editPostal"
        value="${client.postal_code || ""}"
        placeholder="Postcode"
      >

      <textarea
        id="editAnimals"
        placeholder="Dieren"
      >${(client.animals || []).join("\n")}</textarea>

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

  document
    .getElementById(
      "closeEditBtn"
    )
    .onclick = () => {

      modal.remove();
    };

  document
    .getElementById(
      "saveEditBtn"
    )
    .onclick = async () => {

      const full_name =
        document.getElementById(
          "editName"
        ).value;

      const email =
        document.getElementById(
          "editEmail"
        ).value;

      const phone =
        document.getElementById(
          "editPhone"
        ).value;

      const address =
        document.getElementById(
          "editAddress"
        ).value;

      const postal_code =
        document.getElementById(
          "editPostal"
        ).value;

      const animals =
        document.getElementById(
          "editAnimals"
        ).value
        .split("\n")
        .filter(Boolean);

      const notes =
        document.getElementById(
          "editNotes"
        ).value;

      const { error } =
        await supabase
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

        alert(
          error.message
        );

        return;
      }

      modal.remove();

      location.reload();
    };
}
