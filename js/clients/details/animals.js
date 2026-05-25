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
      async () => {

        const name =
          prompt(
            "Naam dier"
          );

        if (!name) {
          return;
        }

        const type =
          prompt(
            "Soort dier"
          ) || "";

        const breed =
          prompt(
            "Ras"
          ) || "";

        const age =
          prompt(
            "Leeftijd"
          ) || "";

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
            age
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

        // REFRESH
        await renderClientAnimals(
          client,
          supabase
        );
      };
  }
}