export async function loadOwnClientProfile(
  supabase,
  profile
) {

  const clientsPanel =
    document.getElementById(
      "chatList"
    );

  if (!clientsPanel) {
    return;
  }

  // GEEN CLIENT GEKOPPELD
  if (!profile?.client_id) {

    clientsPanel.innerHTML = `
      <p>
        Geen cliënt gekoppeld
      </p>
    `;

    return;
  }

  // CLIENT OPHALEN
  const {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*")
    .eq(
      "id",
      profile.client_id
    )
    .maybeSingle();

  // FOUT
  if (error || !data) {

    console.error(
      "CLIENT LOAD ERROR:",
      error
    );

    clientsPanel.innerHTML = `
      <p>
        Fout bij laden dossier
      </p>
    `;

    return;
  }

  // UI
  clientsPanel.innerHTML = `

    <div class="client-card">

      <h1>
        Mijn dossier
      </h1>

      <h2>
        ${data.full_name || "Naam onbekend"}
      </h2>

      <p>
        📧 ${data.email || "-"}
      </p>

      <p>
        📞 ${data.phone || "-"}
      </p>

      <p>
        📍 ${data.address || "-"}
      </p>

      <p>
        Status:
        ${data.status || "-"}
      </p>

    </div>
    <div class="client-card">

  <h2>
    Mijn dieren
  </h2>

  <div id="portalAnimals">
    Laden...
  </div>

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
  `;

  // BESTANDEN LADEN
  await loadClientFiles(
    supabase,
    profile.client_id
  );
  await loadPortalAnimals(
  supabase,
  profile.client_id
);
  // UPLOAD BUTTON
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
            uploadError
          );

          return;
        }

        // DATABASE INSERT
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

        // REFRESH
        await loadClientFiles(
          supabase,
          profile.client_id
        );
      };
  }
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

  // ERROR
  if (error) {

    console.error(error);

    list.innerHTML =
      "Fout bij laden";

    return;
  }

  // GEEN BESTANDEN
  if (!data?.length) {

    list.innerHTML =
      "Geen bestanden";

    return;
  }

  // RENDER
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

  // PREVIEWS
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

  // OPEN FILE
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
async function loadPortalAnimals(
  supabase,
  clientId
) {

  const container =
    document.getElementById(
      "portalAnimals"
    );

  if (!container) {
    return;
  }

  const {
    data,
    error
  } = await supabase
    .from("animals")
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

    container.innerHTML =
      "Fout bij laden dieren";

    return;
  }

  if (!data?.length) {

    container.innerHTML =
      "Geen dieren gevonden";

    return;
  }

  container.innerHTML =
    `

      <div class="portal-animals">

        ${data.map(animal => `

          <div
            class="
              portal-animal-card
              ${
                animal.status ===
                "overleden"

                  ? "deceased"

                  : ""
              }
            "
          >

            ${
              animal.photo_url

                ? `

                  <img
                    src="${
                      supabase
                        .storage
                        .from(
                          "animal-photos"
                        )
                        .getPublicUrl(
                          animal.photo_url
                        )
                        .data.publicUrl
                    }"
                    class="
                      portal-animal-photo
                    "
                  >

                `

                : `

                  <div
                    class="
                      portal-animal-icon
                    "
                  >
                    🐾
                  </div>

                `
            }

            <h3>
              ${animal.name || "-"}
            </h3>

            <p>
              ${animal.type || "-"}
            </p>

            <p>
              ${animal.breed || "-"}
            </p>

            <p>
              Leeftijd:
              ${animal.age || "-"}
            </p>

            <p>
              Status:
              ${animal.status || "actief"}
            </p>

          </div>

        `).join("")}

      </div>

    `;
}