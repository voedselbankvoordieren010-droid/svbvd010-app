export function showClientDetails(
  client,
  supabase
) {

  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "modal-overlay";

  modal.innerHTML = `

    <div class="modal">

      <h2>
        ${client.full_name || ""}
      </h2>

      <p>
        📧 ${client.email || "-"}
      </p>

      <p>
        📞 ${client.phone || "-"}
      </p>

      <p>
        📍 ${client.address || "-"}
      </p>

      <p>
        ${client.postal_code || "-"}
      </p>

      <p>
        Status:
        ${client.status || "-"}
      </p>

      <h3>
        Dieren
      </h3>

      <ul>

        ${(client.animals || [])
          .map(animal => `
            <li>${animal}</li>
          `)
          .join("")}

      </ul>

      <button
        id="closeDetailsBtn"
      >
        Sluiten
      </button>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  document
    .getElementById(
      "closeDetailsBtn"
    )
    .onclick = () => {

      modal.remove();
    };
}

