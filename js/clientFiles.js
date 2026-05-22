export async function loadClientFiles(
  clientId,
  supabase
) {

  const list =
    document.getElementById(
      "clientFilesList"
    );

  if (!list) {
    return;
  }

  // BESTANDEN OPHALEN
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

  // FOUT
  if (error) {

    console.error(
      "LOAD FILES ERROR:",
      error
    );

    list.innerHTML = `

      <p>
        Fout bij laden bestanden
      </p>

    `;

    return;
  }

  // GEEN BESTANDEN
  if (!data?.length) {

    list.innerHTML = `

      <p>
        Geen bestanden
      </p>

    `;

    return;
  }

  // RENDER
  list.innerHTML =
    data.map(file => {

      const isImage =
        file.file_name?.match(
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
            class="open-file-btn"
            data-path="${file.file_path}"
          >
            Openen
          </button>

        </div>

      `;
    }).join("");

  // PREVIEWS LADEN
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

  // OPEN BESTAND
  document
    .querySelectorAll(
      ".open-file-btn"
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

          if (
            data?.signedUrl
          ) {

            window.open(
              data.signedUrl
            );
          }
        };
    });
}

export async function uploadClientFile(
  client,
  supabase
) {

  const input =
    document.getElementById(
      "clientFileInput"
    );

  if (!input) {
    return;
  }

  const file =
    input.files[0];

  // GEEN BESTAND
  if (!file) {

    alert(
      "Geen bestand gekozen"
    );

    return;
  }

  const filePath =
    `${client.id}/${Date.now()}-${file.name}`;

  // STORAGE UPLOAD
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
      "UPLOAD ERROR:",
      uploadError
    );

    alert(
      uploadError.message
    );

    return;
  }

  // DATABASE INSERT
  const {
    error: dbError
  } = await supabase
    .from("client_files")
    .insert({

      client_id:
        client.id,

      file_name:
        file.name,

      file_path:
        filePath
    });

  if (dbError) {

    console.error(
      "DATABASE ERROR:",
      dbError
    );

    alert(
      dbError.message
    );

    return;
  }

  // INPUT RESET
  input.value = "";

  // REFRESH
  await loadClientFiles(
    client.id,
    supabase
  );
}
