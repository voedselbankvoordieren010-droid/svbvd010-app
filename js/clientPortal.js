export async function loadOwnClientProfile(supabase, profile) {
  const clientsPanel = document.getElementById("chatList");

  if (!clientsPanel) {
    return;
  }

  // 1. Veiligere check met '?.', voor het geval profile zelf null/undefined is
  if (!profile?.client_id) {
    clientsPanel.innerHTML = `<p>Geen cliënt gekoppeld</p>`;
    return;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", profile.client_id)
    .maybeSingle(); // 2. 'maybeSingle' voorkomt een crash als de ID niet bestaat

  // 3. Betere foutafhandeling: toon ook als er simpelweg geen dossier is gevonden
  if (error || !data) {
    console.error("Supabase fout of leeg resultaat:", error);
    clientsPanel.innerHTML = `<p>Fout bij laden dossier (bestaat niet of geen toegang)</p>`;
    return;
  }

  // 4. Data veilig tonen
  clientsPanel.innerHTML = `
    <div class="client-card">
      <h1>Mijn dossier</h1>
      <h2>${data.full_name || "Naam onbekend"}</h2>
      <p>📧 ${data.email || "-"}</p>
      <p>📞 ${data.phone || "-"}</p>
      <p>📍 ${data.address || "-"}</p>
      <p>Status: ${data.status || "-"}</p>
    
      </div>

      <div class="client-card">

        <h2>
          Mijn bestanden
        </h2>

        <input
          id="clientUploadInput"
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

      </div>
    </div>
  `;

  await loadClientFiles(
    supabase,
    profile.client_id
  );

  const uploadBtn =
    document.getElementById(
      "uploadClientFileBtn"
    );

  if (uploadBtn) {

    uploadBtn.onclick =
      async () => {

        const input =
          document.getElementById(
            "clientUploadInput"
          );

        const file =
          input.files[0];

        if (!file) {
          return;
        }

        const filePath =
          `${profile.client_id}/${Date.now()}-${file.name}`;

        const {
          error: uploadError
        } = await supabase
          .storage
          .from("client-files")
          .upload(
            filePath,
            file
          );

        if (uploadError) {

          console.error(
            uploadError
          );

          return;
        }

        await supabase
          .from("client_files")
          .insert({

            client_id:
              profile.client_id,

            file_name:
              file.name,

            file_path:
              filePath
          });

        await loadClientFiles(
          supabase,
          profile.client_id
        );
      };
    }
  async function loadClientFiles(
  supabase,
  clientId
) {

  const list =
    document.getElementById(
      "clientFilesList"
    );

  if (!list) {
    return;
  }

  const {
    data,
    error
  } = await supabase
    .from("client_files")
    .select("*")
    .eq(
      "client_id",
      clientId
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.error(error);

    list.innerHTML =
      "Fout bij laden";

    return;
  }

  if (!data?.length) {

    list.innerHTML =
      "Geen bestanden";

    return;
  }

  list.innerHTML =
  data.map(file => {

    const isImage =
      file.file_name.match(
        /\.(jpg|jpeg|png|gif|webp)$/i
      );

    const preview =
      isImage
        ? `

          <img
            class="file-preview"
            data-path="${file.file_path}"
          >

        `
        : `

          <div class="file-icon">
            📄
          </div>

        `;

    return `

      <div class="file-item">

        ${preview}

        <p>
          ${file.file_name}
        </p>

        <button
          class="open-client-file"
          data-path="${file.file_path}"
        >
          Openen
        </button>

      </div>

    `;
  }).join("");

const previews =
  document.querySelectorAll(
    ".file-preview"
  );

for (const img of previews) {

  const path =
    img.dataset.path;

  const { data } =
    await supabase
      .storage
      .from("client-files")
      .createSignedUrl(
        path,
        3600
      );

  if (data?.signedUrl) {

    img.src =
      data.signedUrl;
  }
}

document
  .querySelectorAll(
    ".open-client-file"
  )
  .forEach(btn => {

    btn.onclick =
      async () => {

        const path =
          btn.dataset.path;

        const { data } =
          await supabase
            .storage
            .from("client-files")
            .createSignedUrl(
              path,
              3600
            );

        if (data?.signedUrl) {

          window.open(
            data.signedUrl
          );
        }
      };
  });
}
}