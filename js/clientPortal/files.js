export async function loadClientFiles(supabase, clientId) {
  const list = document.getElementById("clientFilesList");
  if (!list) {
    return;
  }

  const { data, error } = await supabase
    .from("client_files")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    list.innerHTML = "Fout bij laden";
    return;
  }

  if (!data?.length) {
    list.innerHTML = "Geen bestanden";
    return;
  }

  list.innerHTML = data
    .map(file => {
      const isImage = file.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const preview = isImage
        ? `
            <img class="file-preview" data-path="${file.file_path}">
          `
        : `
            <div class="file-icon">📄</div>
          `;

      return `
        <div class="file-item">
          ${preview}
          <p>${file.file_name}</p>
          <button class="btn open-client-file" data-path="${file.file_path}">Openen</button>
        </div>
      `;
    })
    .join("");

  const previews = document.querySelectorAll(".file-preview");
  for (const img of previews) {
    const path = img.dataset.path;
    const { data } = await supabase.storage.from("client-files").createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      img.src = data.signedUrl;
    }
  }

  document.querySelectorAll(".open-client-file").forEach(btn => {
    btn.onclick = async () => {
      const path = btn.dataset.path;
      const { data } = await supabase.storage.from("client-files").createSignedUrl(path, 3600);
      if (data?.signedUrl) {
        window.open(data.signedUrl);
      }
    };
  });
}
