export async function loadAanvragen(
  supabase,
  state
) {

  const container =
    document.getElementById(
      "aanvragen"
    );

  if (!container) {
    return;
  }

  container.innerHTML =
    "<p>Laden...</p>";

  const {
    data,
    error
  } = await supabase
    .from("client_aanvragen")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    container.innerHTML =
      "<p>Fout bij laden</p>";

    return;
  }

  container.innerHTML = `
    <h1>Aanvragen</h1>
  `;

  data.forEach(
    aanvraag => {

      container.innerHTML += `
        <div class="client-card">

          <h3>
            ${aanvraag.naam || "-"}
          </h3>

          <p>
            ${aanvraag.email || "-"}
          </p>

          <p>
            ${aanvraag.telefoon || "-"}
          </p>

          <span>
            ${aanvraag.status}
          </span>

          <div>

            <button
              class="approveBtn"
              data-id="${aanvraag.id}"
            >
              Goedkeuren
            </button>

            <button
              class="rejectBtn"
              data-id="${aanvraag.id}"
            >
              Afwijzen
            </button>

          </div>

        </div>
      `;
    }
  );
}