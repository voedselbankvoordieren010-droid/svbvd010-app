export async function loadPortalAnimals(supabase, clientId) {
  const container = document.getElementById("portalAnimals");
  if (!container) {
    return;
  }

  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = "Fout bij laden dieren";
    return;
  }

  if (!data?.length) {
    container.innerHTML = "Geen dieren gevonden";
    return;
  }

  container.innerHTML = `
      <div class="portal-animals">
        ${data
          .map(animal => `
          <div class="portal-animal-card ${animal.status === "overleden" ? "deceased" : ""}">
            ${animal.photo_url
              ? `
                  <img
                    src="${supabase.storage.from("animal-photos").getPublicUrl(animal.photo_url).data.publicUrl}"
                    class="portal-animal-photo"
                  >
                `
              : `
                  <div class="portal-animal-icon">🐾</div>
                `}

            <h3>${animal.name || "-"}</h3>
            <p>${animal.type || "-"}</p>
            <p>${animal.breed || "-"}</p>
            <p>Leeftijd: ${animal.age || "-"}</p>
            <p>Status: ${animal.status || "actief"}</p>
            <button class="btn portal-upload-photo-btn" data-id="${animal.id}">📸 Foto uploaden</button>
          </div>
        `)
          .join("")}
      </div>
    `;

  document.querySelectorAll(".portal-upload-photo-btn").forEach(btn => {
    btn.onclick = async () => {
      const animalId = btn.dataset.id;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          return;
        }

        const filePath = `animals/${animalId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("animal-photos").upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error(uploadError);
          alert(uploadError.message);
          return;
        }

        const { error: updateError } = await supabase
          .from("animals")
          .update({ photo_url: filePath })
          .eq("id", animalId);

        if (updateError) {
          console.error(updateError);
          alert(updateError.message);
          return;
        }

        await loadPortalAnimals(supabase, clientId);
      };

      input.click();
    };
  });
}
