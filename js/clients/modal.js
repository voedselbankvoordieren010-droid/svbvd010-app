import {
  loadClients
} from "./index";

export function initClientModal(
  supabase,
  state
) {

  const btn =
    document.getElementById(
      "newClientBtn"
    );

  if (!btn) {
    return;
  }

  btn.onclick =
    () => {

      const existing =
        document.querySelector(
          ".modal-overlay"
        );

      if (existing) {
        existing.remove();
      }

      const modal =
        document.createElement(
          "div"
        );

      modal.className =
        "modal-overlay";

      modal.innerHTML = `

        <div class="modal">

          <h2>
            Nieuwe cliënt
          </h2>

          <input
            id="clientName"
            placeholder="Naam"
          >

          <input
            id="clientEmail"
            placeholder="Email"
          >

          <input
            id="clientPhone"
            placeholder="Telefoon"
          >

          <input
            id="clientCity"
            placeholder="Plaats"
          >

          <input
            id="clientAddress"
            placeholder="Adres"
          >

          <input
            id="clientPostal"
            placeholder="Postcode"
          >

          <textarea
            id="clientAnimals"
            placeholder="Dieren (1 per regel)"
          ></textarea>

          <textarea
            id="clientNotes"
            placeholder="Notities"
          ></textarea>

          <div class="modal-actions">

            <button
              id="saveClientBtn"
              class="btn"
            >
              Opslaan
            </button>

            <button
              id="closeModalBtn"
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
          "closeModalBtn"
        )
        .onclick =
        () => {

          modal.remove();
        };

      document
        .getElementById(
          "saveClientBtn"
        )
        .onclick =
        async () => {

          const full_name =
            document.getElementById(
              "clientName"
            )?.value?.trim() || "";

          const email =
            document.getElementById(
              "clientEmail"
            )?.value?.trim() || "";

          const phone =
            document.getElementById(
              "clientPhone"
            )?.value?.trim() || "";

          const city =
            document.getElementById(
              "clientCity"
            )?.value?.trim() || "";

          const address =
            document.getElementById(
              "clientAddress"
            )?.value?.trim() || "";

          const postal_code =
            document.getElementById(
              "clientPostal"
            )?.value?.trim() || "";

          const animals =
            document.getElementById(
              "clientAnimals"
            )?.value
              ?.split("\n")
              .map(a => a.trim())
              .filter(Boolean) || [];

          const notes =
            document.getElementById(
              "clientNotes"
            )?.value?.trim() || "";

          const {
            error
          } = await supabase
            .from("clients")
            .insert({

              full_name,
              email,
              phone,
              city,
              address,
              postal_code,
              animals,
              notes,

              status: "nieuw",

              created_by:
                state.session.user.id
            });

          if (error) {

            console.error(error);

            alert(
              error.message
            );

            return;
          }

          modal.remove();

          await loadClients(
            supabase,
            state
          );
        };
    };
}