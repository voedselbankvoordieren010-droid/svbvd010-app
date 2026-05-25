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

  panel.innerHTML = `

    <div class="animals-header">

      <h3>
        Dieren
      </h3>

      <button
        id="addAnimalBtn"
        class="btn"
      >
        + Dier toevoegen
      </button>

    </div>

    <div class="animals-grid">

      ${
        animals?.length

          ? animals.map(animal => `

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

              </div>

            `).join("")

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

  if (addBtn) {

    addBtn.onclick =
  () => {

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
          >
            Opslaan
          </button>

          <button
            id="closeAnimalBtn"
            class="btn"
          >
            Sluiten
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    document
      .getElementById(
        "closeAnimalBtn"
      )
      .onclick =
      () => {

        modal.remove();
      };

    document
      .getElementById(
        "saveAnimalBtn"
      )
      .onclick =
      async () => {

        const name =
          document
            .getElementById(
              "animalName"
            )
            ?.value
            ?.trim() || "";

        if (!name) {

          alert(
            "Naam verplicht"
          );

          return;
        }

        const type =
          document
            .getElementById(
              "animalType"
            )
            ?.value
            ?.trim() || "";

        const breed =
          document
            .getElementById(
              "animalBreed"
            )
            ?.value
            ?.trim() || "";

        const age =
          document
            .getElementById(
              "animalAge"
            )
            ?.value
            ?.trim() || "";

        const gender =
          document
            .getElementById(
              "animalGender"
            )
            ?.value
            ?.trim() || "";

        const food =
          document
            .getElementById(
              "animalFood"
            )
            ?.value
            ?.trim() || "";

        const medical_notes =
          document
            .getElementById(
              "animalMedical"
            )
            ?.value
            ?.trim() || "";

        const {
          error: insertError
        } = await supabase
          .from("animals")
          .insert({

            client_id:
              client.id,

            name,
            type,
            breed,
            age,
            gender,
            food,
            medical_notes
          });

        if (insertError) {

          console.error(
            insertError
          );

          alert(
            insertError.message
          );

          return;
        }

                modal.remove();

        await renderClientAnimals(
          client,
          supabase
        );
      };
  }
}