import {
  loadClientFiles,
  uploadClientFile
} from "../../clientFiles.js";

export async function renderClientFiles(
  client,
  supabase
) {

  const panel =
    document.getElementById(
      "files"
    );

  if (!panel) {
    return;
  }

  panel.innerHTML = `

    <div class="files-header">
      <h3>
        Bestanden
      </h3>
      <div class="file-actions">
        <button
          id="uploadClientFileBtn"
          class="btn"
          type="button"
        >
          Upload bestand
        </button>
        <input
          id="clientFileInput"
          type="file"
          hidden
        >
      </div>
    </div>

    <div id="clientFilesList"></div>
  `;

  const uploadBtn = document.getElementById(
    "uploadClientFileBtn"
  );

  const fileInput = document.getElementById(
    "clientFileInput"
  );

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => {
      fileInput.click();
    };

    fileInput.onchange = async () => {
      await uploadClientFile(client, supabase);
    };
  }

  await loadClientFiles(client.id, supabase);
}
