import {
  initClientModal
} from "./clients.js";
export function initClientModal(
  supabase,
  state
) {

  const btn =
    document.getElementById(
      "newClientBtn"
    );

  if (!btn) return;

  btn.onclick = () => {

    const modal =
      document.createElement("div");

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

        <textarea
          id="clientNotes"
          placeholder="Notities"
        ></textarea>

        <div class="modal-actions">

          <button id="saveClientBtn">
            Opslaan
          </button>

          <button id="closeModalBtn">
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
      .onclick = () => {

        modal.remove();
      };

    document
      .getElementById(
        "saveClientBtn"
      )
      .onclick = async () => {

        const full_name =
          document.getElementById(
            "clientName"
          ).value;

        const email =
          document.getElementById(
            "clientEmail"
          ).value;

        const phone =
          document.getElementById(
            "clientPhone"
          ).value;

        const city =
          document.getElementById(
            "clientCity"
          ).value;

        const notes =
          document.getElementById(
            "clientNotes"
          ).value;

        const { error } =
          await supabase
            .from("clients")
            .insert({

              full_name,
              email,
              phone,
              city,
              notes,

              status: "nieuw",

              created_by:
                state.session.user.id
            });

        if (error) {

          alert(
            error.message
          );

          return;
        }

        modal.remove();

        loadClients(
          supabase,
          state
        );
      };
  };
}