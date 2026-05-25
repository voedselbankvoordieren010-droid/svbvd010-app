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

  // DATABASE LOAD
  const {
    data: animals,
    error
  } = await supabase
    .from("animals")
    .select("*")
    .eq(
      "client_id",
      client.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  console.log(
    "ANIMALS:",
    animals
  );

  console.log(
    "ANIMALS ERROR:",
    error
  );

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
              .map(animal => `

              <div class="animal-card">

                <div class="animal-icon">
                  🐾
                </div>

                <h4>
                  ${animal.name || "-"}
                </h4>

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
                  Geslacht:
                  ${animal.gender || "-"}
                </p>

                <p>
                  Voeding:
                  ${animal.food || "-"}
                </p>

                <p>
                  Status:
                  ${animal.status || "actief"}
                </p>

                <div class="animal-actions">

  <button
    class="btn edit-animal-btn"
    data-id="${animal.id}"
  >
    Bewerken
  </button>

  <button
    class="btn danger-btn delete-animal-btn"
    data-id="${animal.id}"
  >
    Verwijderen
  </button>

</div>
                <p>
                  Medisch:
                  ${animal.medical_notes || "-"}
                </p>

              </div>

            `)
              .join("")
          : `
              <p>
                Geen dieren toegevoegd
              </p>
            `
      }

    </div>
  `;

  // NIEUW DIER
  const addBtn =
    document.getElementById(
      "addAnimalBtn"
    );

  if (!addBtn) {
  return;
}

addBtn.onclick = () => {

  // modal code

};

document
  .querySelectorAll(
    ".delete-animal-btn"
  )
  .forEach(btn => {

    // delete code

  });

document
  .querySelectorAll(
    ".edit-animal-btn"
  )
  .forEach(btn => {

    // edit code

  });

  addBtn.onclick = () => {
    const existing =
      document.querySelector(
        ".animal-modal-overlay"
      );

    if (existing) {
      existing.remove();
    }

    const modal =
      document.createElement(
        "div"
      );

    modal.className =
      "animal-modal-overlay";

    modal.innerHTML = `

      <div class="animal-modal">

        <h2>
          Dier toevoegen
        </h2>

        <input
          id="animalName"
          placeholder="Naam"
        >

        <input
          id="animalType"
          placeholder="Soort"
        >

        <input
          id="animalBreed"
          placeholder="Ras"
        >

        <input
          id="animalAge"
          placeholder="Leeftijd"
        >

        <input
          id="animalGender"
          placeholder="Geslacht"
        >

        <input
          id="animalFood"
          placeholder="Voeding"
        >

        <textarea
          id="animalMedical"
          placeholder="Medische info"
        ></textarea>

        <div class="modal-actions">

          <button
            id="saveAnimalBtn"
            class="btn"
            type="button"
          >
            Opslaan
          </button>

          <button
            id="closeAnimalBtn"
            class="btn"
            type="button"
          >
            Sluiten
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    const closeBtn =
      document.getElementById(
        "closeAnimalBtn"
      );

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.remove();
      };
    }

    const saveBtn =
      document.getElementById(
        "saveAnimalBtn"
      );

    if (!saveBtn) {
      return;
    }

    const getValue = (id) =>
      document
        .getElementById(id)
        ?.value
        ?.trim() || "";

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

      const {
        error: insertError
      } = await supabase
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
}
