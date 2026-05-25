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

    <h3>
      Dieren
    </h3>

    ${
      animals.length
        ? animals.map(a => `

            <div class="animal-card">

  🐾 ${a}

</div>

          `).join("")
        : "<p>Geen dieren</p>"
    }
  `;
}