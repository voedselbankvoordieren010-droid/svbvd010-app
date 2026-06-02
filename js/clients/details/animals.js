export async function renderClientAnimals(
  client,
  supabase
) {
  const panel =
    document.getElementById(
      "animals"
    );

  if (!panel) {
    return;
  }

  const {
    data: animals,
    error
  } = await supabase
    .from("animals")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", {
      ascending: false
    });

  console.log("ANIMALS:", animals);
  console.log("ANIMALS ERROR:", error);

  const animalsList = animals ?? [];

  panel.innerHTML = `
    <div class="animals-header">
      <h3>
        Dieren
      </h3>
      <button
        id="addAnimalBtn"
        class="btn"
        type="button"
      >
        + Dier toevoegen
      </button>
    </div>

    <div class="animals-grid">
      ${
        error
          ? `
              <div class="animal-error">
                <p>
                  Er is een fout opgetreden bij het laden van dieren.
                </p>
              </div>
            `
          : animalsList.length
          ? animalsList
              .map(
                (animal) => `
              <div
  class="
    animal-card
    ${
      animal.status === "overleden"
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
            .from("animal-photos")
            .getPublicUrl(
              animal.photo_url
            )
            .data.publicUrl
        }"
        class="animal-photo"
      >

    `

    : `

      <div class="animal-icon">
        🐾
      </div>

    `
}
                <h4>${animal.name || "-"}</h4>
                <p>${animal.type || "-"}</p>
                <p>${animal.breed || "-"}</p>
                <p>Leeftijd: ${animal.age || "-"}</p>
                <p>Geslacht: ${animal.gender || "-"}</p>
                <p>Voeding: ${animal.food || "-"}</p>
                <p>Status: ${animal.status || "actief"}</p>
                <div class="animal-actions">
                  <button
                    class="btn edit-animal-btn"
                    data-id="${animal.id}"
                    type="button"
                  >
                    Bewerken
                  </button>
                  <button
                    class="btn upload-animal-photo-btn"
                    data-id="${animal.id}"
                    type="button"
                  >
                    Foto uploaden
                  </button>
                  ${animal.photo_url ? `
                    <button
                      class="btn danger-btn delete-animal-photo-btn"
                      data-id="${animal.id}"
                      type="button"
                    >
                      Foto verwijderen
                    </button>
                  ` : ""}
                  <button
                    class="btn danger-btn delete-animal-btn"
                    data-id="${animal.id}"
                    type="button"
                  >
                    Verwijderen
                  </button>
                  <button
                    class="btn deceased-btn"
                    data-id="${animal.id}"
                  >
                    Overleden
                  </button>
                </div>
                <p>Medisch: ${animal.medical_notes || "-"}</p>
              </div>
            `
              )
              .join("")
          : `
              <p>
                Geen dieren toegevoegd
              </p>
            `
      }
    </div>
  `;

  const addBtn = document.getElementById("addAnimalBtn");
  if (!addBtn) {
    return;
  }

  const openAnimalModal = () => {
    const existing =
      document.querySelector(
        ".animal-modal-overlay"
      );

    if (existing) {
      existing.remove();
    }

    const modal = document.createElement("div");
    modal.className = "animal-modal-overlay";

    modal.innerHTML = `
      <div class="animal-modal">
        <h2>Dier toevoegen</h2>
        <input id="animalName" placeholder="Naam">
        <input id="animalType" placeholder="Soort">
        <input id="animalBreed" placeholder="Ras">
        <input id="animalAge" placeholder="Leeftijd">
        <input id="animalGender" placeholder="Geslacht">
        <input id="animalFood" placeholder="Voeding">
        <textarea id="animalMedical" placeholder="Medische info"></textarea>
        <div class="modal-actions">
          <button id="saveAnimalBtn" class="btn" type="button">Opslaan</button>
          <button id="closeAnimalBtn" class="btn" type="button">Sluiten</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById("closeAnimalBtn");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.remove();
      };
    }

    const saveBtn = document.getElementById("saveAnimalBtn");
    if (!saveBtn) {
      return;
    }

    const getValue = (id) =>
      document.getElementById(id)?.value?.trim() || "";

    saveBtn.onclick = async () => {
      const name = getValue("animalName");
      if (!name) {
        alert("Naam verplicht");
        return;
      }

      const type = getValue("animalType");
      const breed = getValue("animalBreed");
      const age = getValue("animalAge");
      const gender = getValue("animalGender");
      const food = getValue("animalFood");
      const medical_notes = getValue("animalMedical");

      const { error: insertError } = await supabase
        .from("animals")
        .insert({
          client_id: client.id,
          name,
          type,
          breed,
          age,
          gender,
          food,
          medical_notes
        });

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        return;
      }

      modal.remove();
      await renderClientAnimals(client, supabase);
    };
  };

  addBtn.onclick = openAnimalModal;

  document.querySelectorAll(
    ".delete-animal-btn"
  ).forEach((btn) => {
    btn.onclick = async () => {
      const confirmed = confirm("Dier verwijderen?");
      if (!confirmed) {
        return;
      }

      const animalId = btn.dataset.id;
      const { error: deleteError } = await supabase
        .from("animals")
        .delete()
        .eq("id", animalId);

      if (deleteError) {
        console.error(deleteError);
        alert(deleteError.message);
        return;
      }

      await renderClientAnimals(client, supabase);
    };
  });

  document
    .querySelectorAll(
      ".deceased-btn"
    )
    .forEach((btn) => {
      btn.onclick = async () => {
        const confirmed = confirm(
          "Markeer dier als overleden?"
        );

        if (!confirmed) {
          return;
        }

        const animalId = btn.dataset.id;
        const {
          error: updateError
        } = await supabase
          .from("animals")
          .update({
            status: "overleden",
            is_active: false,
            deceased_at: new Date().toISOString()
          })
          .eq("id", animalId);

        if (updateError) {
          console.error(updateError);
          alert(updateError.message);
          return;
        }

        await renderClientAnimals(client, supabase);
      };
    });
document
  .querySelectorAll(
    ".upload-animal-photo-btn"
  )
  .forEach((btn) => {

    btn.onclick =
      async () => {

        const animalId =
          btn.dataset.id;

        const input =
          document.createElement(
            "input"
          );

        input.type = "file";

        input.accept =
          "image/*";

        input.onchange =
          async () => {

            const file =
              input.files?.[0];

            if (!file) {
              return;
            }

            const filePath = `animals/${animalId}/${Date.now()}-${file.name}`;

            const {
              error: uploadError
            } = await supabase
              .storage
              .from(
                "animal-photos"
              )
              .upload(
                filePath,
                file,
                {
                  upsert: true
                }
              );

            if (uploadError) {

              console.error(
                uploadError
              );

              alert(
                uploadError.message
              );

              return;
            }

            const {
              error: updateError
            } = await supabase
              .from("animals")
              .update({

                photo_url:
                  filePath
              })
              .eq(
                "id",
                animalId
              );

            if (updateError) {

              console.error(
                updateError
              );

              alert(
                updateError.message
              );

              return;
            }

            await renderClientAnimals(
              client,
              supabase
            );
          };

        input.click();
      };
  });

  document
  .querySelectorAll(
    ".delete-animal-photo-btn"
  )
  .forEach((btn) => {

    btn.onclick =
      async () => {

        const animalId =
          btn.dataset.id;

        const animal =
          animalsList.find(
            (a) =>
              String(a.id) ===
              animalId
          );

        if (
          !animal?.photo_url
        ) {

          alert(
            "Geen foto gevonden"
          );

          return;
        }

        const confirmed =
          confirm(
            "Foto verwijderen?"
          );

        if (!confirmed) {
          return;
        }

        await supabase
          .storage
          .from(
            "animal-photos"
          )
          .remove([
            animal.photo_url
          ]);

        const {
          error: updateError
        } = await supabase
          .from("animals")
          .update({

            photo_url: null
          })
          .eq(
            "id",
            animalId
          );

        if (updateError) {

          console.error(
            updateError
          );

          alert(
            updateError.message
          );

          return;
        }

        await renderClientAnimals(
          client,
          supabase
        );
      };
  });
  
  document
    .querySelectorAll(
      ".edit-animal-btn"
    )
    .forEach((btn) => {
      btn.onclick = async () => {
        const animalId = btn.dataset.id;
        const animal = animalsList.find(
          (a) => String(a.id) === animalId
        );

        if (!animal) {
          return;
        }

        const name = prompt("Naam", animal.name || "");
        if (!name) {
          return;
        }

        const type = prompt("Soort", animal.type || "") || "";
        const breed = prompt("Ras", animal.breed || "") || "";
        const age = prompt("Leeftijd", animal.age || "") || "";
        const gender = prompt("Geslacht", animal.gender || "") || "";
        const food = prompt("Voeding", animal.food || "") || "";
        const status = prompt("Status", animal.status || "") || "actief";
        const medical_notes = prompt(
          "Medische info",
          animal.medical_notes || ""
        ) || "";

        const {
          error: updateError
        } = await supabase
          .from("animals")
          .update({
            name,
            type,
            breed,
            age,
            gender,
            food,
            status,
            medical_notes
          })
          .eq("id", animalId);

        if (updateError) {
          console.error(updateError);
          alert(updateError.message);
          return;
        }

        await renderClientAnimals(client, supabase);
      };
    });
}
