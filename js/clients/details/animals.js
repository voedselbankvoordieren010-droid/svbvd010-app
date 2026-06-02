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
                <p>Gevaccineerd: ${animal.vaccinated ? "Ja" : "Nee"}</p>
                <p>Speciale voeding: ${animal.special_food ? animal.special_food : "Nee"}</p>
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
                    class="btn upload-animal-proof-btn"
                    data-id="${animal.id}"
                    type="button"
                  >
                    Upload dierenartsbewijs
                  </button>
                  ${animal.vet_proof_url ? `
                    <button
                      class="btn open-animal-proof-btn"
                      data-id="${animal.id}"
                      data-proof-url="${animal.vet_proof_url}"
                      type="button"
                    >
                      Open bewijs
                    </button>
                    <button
                      class="btn danger-btn delete-animal-proof-btn"
                      data-id="${animal.id}"
                      type="button"
                    >
                      Verwijder bewijs
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

  const addBtn = panel.querySelector("#addAnimalBtn");
  if (!addBtn) {
    return;
  }

  const openAnimalModal = (animal = null) => {
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
        <h2>${animal ? "Dier bewerken" : "Dier toevoegen"}</h2>
        <input id="animalName" placeholder="Naam" value="${animal?.name || ""}">
        <input id="animalType" placeholder="Soort" value="${animal?.type || ""}">
        <input id="animalBreed" placeholder="Ras" value="${animal?.breed || ""}">
        <input id="animalAge" placeholder="Leeftijd" value="${animal?.age || ""}">
        <input id="animalGender" placeholder="Geslacht" value="${animal?.gender || ""}">
        <input id="animalFood" placeholder="Voeding" value="${animal?.food || ""}">
        <label class="checkbox-label">
          <input id="animalVaccinated" type="checkbox" ${animal?.vaccinated ? "checked" : ""}>
          Gevaccineerd
        </label>
        <label class="checkbox-label">
          <input id="animalSpecialFoodRequired" type="checkbox" ${animal?.special_food ? "checked" : ""}>
          Speciale voeding nodig
        </label>
        <input id="animalSpecialFood" placeholder="Specifieke voeding" value="${animal?.special_food || ""}">
        <textarea id="animalMedical" placeholder="Medische info">${animal?.medical_notes || ""}</textarea>
        <div class="modal-actions">
          <button id="saveAnimalBtn" class="btn" type="button">Opslaan</button>
          <button id="closeAnimalBtn" class="btn" type="button">Sluiten</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#closeAnimalBtn");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.remove();
      };
    }

    const saveBtn = modal.querySelector("#saveAnimalBtn");
    if (!saveBtn) {
      return;
    }

    const getValue = (id) =>
      modal.querySelector(id ? `#${id}` : "")?.value?.trim() || "";

    const getChecked = (id) =>
      modal.querySelector(id ? `#${id}` : "")?.checked || false;

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
      const vaccinated = getChecked("animalVaccinated");
      const special_food = getValue("animalSpecialFood");
      const medical_notes = getValue("animalMedical");

      const payload = {
        client_id: client.id,
        name,
        type,
        breed,
        age,
        gender,
        food,
        vaccinated,
        special_food,
        medical_notes
      };

      if (animal?.id) {
        const { error: updateError } = await supabase
          .from("animals")
          .update(payload)
          .eq("id", animal.id);

        if (updateError) {
          console.error(updateError);
          alert(updateError.message);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("animals")
          .insert(payload);

        if (insertError) {
          console.error(insertError);
          alert(insertError.message);
          return;
        }
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
      ".upload-animal-proof-btn"
    )
    .forEach((btn) => {
      btn.onclick = async () => {
        const animalId = btn.dataset.id;

        const input =
          document.createElement(
            "input"
          );

        input.type = "file";
        input.accept = "image/*,.pdf";

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            return;
          }

          const filePath = `animals/${animalId}/vet-proof-${Date.now()}-${file.name}`;

          const {
            error: uploadError
          } = await supabase
            .storage
            .from(
              "animal-documents"
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
              vet_proof_url: filePath
            })
            .eq("id", animalId);

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
      ".delete-animal-proof-btn"
    )
    .forEach((btn) => {
      btn.onclick = async () => {
        const animalId = btn.dataset.id;
        const animal = animalsList.find(
          (a) => String(a.id) === animalId
        );

        if (!animal?.vet_proof_url) {
          alert("Geen bewijs gevonden");
          return;
        }

        const confirmed = confirm(
          "Dierenartsbewijs verwijderen?"
        );
        if (!confirmed) {
          return;
        }

        await supabase
          .storage
          .from(
            "animal-documents"
          )
          .remove([
            animal.vet_proof_url
          ]);

        const {
          error: updateError
        } = await supabase
          .from("animals")
          .update({
            vet_proof_url: null
          })
          .eq("id", animalId);

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
      ".open-animal-proof-btn"
    )
    .forEach((btn) => {
      btn.onclick = async () => {
        const proofUrl = btn.dataset.proofUrl;
        if (!proofUrl) {
          alert("Geen bewijs beschikbaar");
          return;
        }

        const { data, error } = await supabase
          .storage
          .from("animal-documents")
          .createSignedUrl(proofUrl, 3600);

        if (error || !data?.signedUrl) {
          console.error(error);
          alert("Kon bewijs niet openen");
          return;
        }

        window.open(data.signedUrl);
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

        openAnimalModal(animal);
      };
    });
}
