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

    list.innerHTML = `
      <p>
        Fout bij laden bestanden
      </p>
    `;

    return;
  }

  if (!data?.length) {

    list.innerHTML = `
      <p>
        Geen bestanden
      </p>
    `;

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
          class="open-file-btn"
          data-path="${file.file_path}"
        >
          Openen
        </button>

      </div>

    `;
  }).join("");


  document
    .querySelectorAll(
      ".open-file-btn"
    )
    .forEach(btn => {

      btn.onclick = async () => {

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

  const file =
    input.files[0];

  if (!file) {

    alert(
      "Geen bestand gekozen"
    );

    return;
  }

  const filePath =
    `${client.id}/${Date.now()}-${file.name}`;

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

    alert(
      uploadError.message
    );

    return;
  }

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

    alert(
      dbError.message
    );

    return;
  }

  loadClientFiles(
    client.id,
    supabase
  );
}
