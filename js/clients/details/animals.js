export function renderClientAnimals(
  client
) {

  const panel =
    document.getElementById(
      "animals"
    );

  if (!panel) {
    return;
  }

  const animals =
    client.animals || [];

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
        animals.length

          ? animals.map(animal => `

              <div class="animal-card">

                <div class="animal-icon">
                  🐾
                </div>

                <h4>
                  ${animal}
                </h4>

                <p>
                  Geen extra info
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

  const addBtn =
    document.getElementById(
      "addAnimalBtn"
    );

  if (addBtn) {

    addBtn.onclick =
      () => {

        alert(
          "Dieren toevoegen komt hier 👌"
        );
      };
  }
}