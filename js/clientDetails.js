import {
  loadClientFiles,
  uploadClientFile
} from "./clientFiles";

import {
  openEditClientModal
} from "./clientEdit";

export function showClientDetails(
  client,
  supabase
) {

  // BESTAANDE MODAL WEG
  const existing =
    document.querySelector(
      ".modal-overlay"
    );

  if (existing) {
    existing.remove();
  }

  // ANIMALS
  const animals =
    Array.isArray(
      client.animals
    )
      ? client.animals
      : [];

  // MODAL
  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "modal-overlay";

  modal.innerHTML = `

    <div class="modal client-modal">

      <h2>
        ${client.full_name || ""}
      </h2>

      <p>
        📧 ${client.email || "-"}
      </p>

      <p>
        📞 ${client.phone || "-"}
      </p>

      <p>
        📍 ${client.address || "-"}
      </p>

      <p>
        ${client.postal_code || "-"}
      </p>

      <p>
        Status:
        ${client.status || "-"}
      </p>

      <h3>
        Dieren
      </h3>

      <ul class="animal-list">

        ${animals
          .map(animal => `

            <li>
              ${animal}
            </li>

          `)
          .join("")}

      </ul>

      <h3>
        Bestanden
      </h3>

      <input
        id="clientFileInput"
        type="file"
      >

      <button
        id="uploadClientFileBtn"
      >
        Upload bestand
      </button>

      <div id="clientFilesList">
        Laden...
      </div>

      <div class="modal-actions">

        <button
          id="editClientBtn"
        >
          Bewerken
        </button>

        <button
          id="closeDetailsBtn"
        >
          Sluiten
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  // BESTANDEN LADEN
  loadClientFiles(
    client.id,
    supabase
  );

  // UPLOAD
  const uploadBtn =
    document.getElementById(
      "uploadClientFileBtn"
    );

  if (uploadBtn) {

    uploadBtn.onclick =
      async () => {

        await uploadClientFile(
          client,
          supabase
        );
      };
  }

  // SLUITEN
  const closeBtn =
    document.getElementById(
      "closeDetailsBtn"
    );

  if (closeBtn) {

    closeBtn.onclick =
      () => {

        modal.remove();
      };
  }

  // EDIT
  const editBtn =
    document.getElementById(
      "editClientBtn"
    );

  if (editBtn) {

    editBtn.onclick =
      () => {

        openEditClientModal(
          client,
          supabase
        );
      };
  }
}
