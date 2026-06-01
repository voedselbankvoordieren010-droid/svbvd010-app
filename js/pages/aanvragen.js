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
  document
  .querySelectorAll(".approveBtn")
  .forEach(btn => {

    btn.onclick =
      async () => {

        const id =
          btn.dataset.id;

        // aanvraag ophalen
        const {
          data: aanvraag,
          error: aanvraagError
        } = await supabase
          .from(
            "client_aanvragen"
          )
          .select("*")
          .eq("id", id)
          .single();

        if (
          aanvraagError ||
          !aanvraag
        ) {

          alert(
            "Aanvraag niet gevonden"
          );

          return;
        }

        // cliënt aanmaken
        const {
          error: clientError
        } = const {
  error: clientError
} = await supabase
  .from("clients")
  .insert({

    full_name:
      aanvraag.naam,

    email:
      aanvraag.email,

    phone:
      aanvraag.telefoon,

    status:
      "actief",

    created_by:
      state.profile.id,

    assigned_to:
      state.profile.id,

    organization_id:
      state.profile.organization_id
  });

        if (clientError) {

          console.error(
            clientError
          );

          alert(
            clientError.message
          );

          return;
        }

        // aanvraag goedkeuren
        const {
          error
        } = await supabase
          .from(
            "client_aanvragen"
          )
          .update({
            status:
              "goedgekeurd"
          })
          .eq(
            "id",
            id
          );

        if (error) {

          alert(
            error.message
          );

          return;
        }

        await loadAanvragen(
          supabase,
          state
        );
      };
  });

document
  .querySelectorAll(".rejectBtn")
  .forEach(btn => {

    btn.onclick =
      async () => {

        const id =
          btn.dataset.id;

        const {
          error
        } = await supabase
          .from(
            "client_aanvragen"
          )
          .update({
            status:
              "afgewezen"
          })
          .eq(
            "id",
            id
          );

        if (error) {

          alert(
            error.message
          );

          return;
        }

        await loadAanvragen(
          supabase,
          state
        );
      };
  });
}