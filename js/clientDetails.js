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

  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "modal-overlay";

  modal.innerHTML = `

    <div class="modal">

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

      <ul>
      
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
      </div>


        ${(client.animals || [])
          .map(animal => `
            <li>${animal}</li>
          `)
          .join("")}

      </ul>

      
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

  `;

  document.body.appendChild(
    modal
  );

  loadClientFiles(
    client.id,
    supabase
  );

  document
    .getElementById(
      "uploadClientFileBtn"
    )
    .onclick = () => {

      uploadClientFile(
        client,
        supabase
      );
    };


  
  document
    .getElementById(
      "closeDetailsBtn"
    )
    .onclick = () => {

      modal.remove();
    };

  document
    .getElementById(
      "editClientBtn"
    )
    .onclick = () => {

      openEditClientModal(
        client,
        supabase
      );
    };
}
